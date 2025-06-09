// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { z } from 'zod';

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  source: z.string().optional().default('coming-soon'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the input
    const validation = waitlistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { email, source } = validation.data;

    // Get Supabase admin client
    const supabase = createServiceRoleClient();

    // Check if email already exists
    const { data: existingEmail, error: checkError } = await supabase
      .from('waitlist')
      .select('id, email, status')
      .eq('email', email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = row not found
      console.error('Error checking existing email:', checkError);
      return NextResponse.json({
        error: 'Database error occurred'
      }, { status: 500 });
    }

    // If email already exists
    if (existingEmail) {
      if (existingEmail.status === 'unsubscribed') {
        // Reactivate unsubscribed email
        const { error: updateError } = await supabase
          .from('waitlist')
          .update({ 
            status: 'active', 
            updated_at: new Date().toISOString(),
            metadata: { reactivated_at: new Date().toISOString() }
          })
          .eq('id', existingEmail.id);

        if (updateError) {
          console.error('Error reactivating email:', updateError);
          return NextResponse.json({
            error: 'Failed to reactivate subscription'
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          email: email
        });
      } else {
        // Email already exists and is active
        return NextResponse.json({
          success: true,
          message: 'You\'re already on our waitlist! We\'ll notify you when we launch.',
          email: email
        });
      }
    }

    // Add new email to waitlist
    const { data: newEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email,
        source,
        status: 'active',
        metadata: {
          signup_timestamp: new Date().toISOString(),
          user_agent: req.headers.get('user-agent') || undefined,
          referrer: req.headers.get('referer') || undefined
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting waitlist entry:', insertError);
      return NextResponse.json({
        error: 'Failed to add email to waitlist'
      }, { status: 500 });
    }

    // Log successful signup
    console.log(`New waitlist signup: ${email} from ${source}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Thanks for joining our waitlist! We\'ll notify you when Lullaby.ai launches.',
      email: email,
      id: newEntry.id
    });

  } catch (error: any) {
    console.error('Waitlist API error:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        error: 'Invalid JSON format'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error occurred'
    }, { status: 500 });
  }
}

// GET endpoint to retrieve waitlist data (admin only)
export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    
    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('waitlist')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: entries, error, count } = await query;

    if (error) {
      console.error('Error fetching waitlist entries:', error);
      return NextResponse.json({
        error: 'Failed to fetch waitlist entries'
      }, { status: 500 });
    }

    // Get basic stats for the dashboard
    const { data: allEntries, error: statsError } = await supabase
      .from('waitlist')
      .select('source, status, created_at');

    if (statsError) {
      console.error('Error fetching stats:', statsError);
      return NextResponse.json({
        error: 'Failed to fetch statistics'
      }, { status: 500 });
    }

    // Calculate basic statistics
    const totalSignups = allEntries?.length || 0;
    const activeSignups = allEntries?.filter(entry => entry.status === 'active').length || 0;
    const sourceBreakdown = allEntries?.reduce((acc: any, entry) => {
      acc[entry.source] = (acc[entry.source] || 0) + 1;
      return acc;
    }, {});

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = allEntries?.filter(entry => 
      new Date(entry.created_at) > sevenDaysAgo
    ).length || 0;

    return NextResponse.json({
      success: true,
      entries: entries || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: {
        total: totalSignups,
        active: activeSignups,
        recent: recentSignups,
        sources: sourceBreakdown
      }
    });

  } catch (error: any) {
    console.error('Waitlist API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch waitlist data'
    }, { status: 500 });
  }
}