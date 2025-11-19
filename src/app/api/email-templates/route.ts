import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all templates or a specific template
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    const templateType = searchParams.get('type');

    if (templateId) {
      // Get specific template
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ template: data });
    }

    if (templateType) {
      // Get default template for a type
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', templateType)
        .eq('is_default', true)
        .single();

      if (error) {
        // Return null if no default template found
        return NextResponse.json({ template: null });
      }

      return NextResponse.json({ template: data });
    }

    // Get all templates
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates: data || [] });
  } catch (error) {
    console.error('Email templates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new template
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, type, subject, html_content, is_default } = body;

    if (!name || !type || !subject || !html_content) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, subject, html_content' },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults of the same type
    if (is_default) {
      await supabase
        .from('email_templates')
        .update({ is_default: false })
        .eq('type', type)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('email_templates')
      .insert([
        {
          name,
          type,
          subject,
          html_content,
          is_default: is_default || false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json(
        { error: 'Failed to create template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    console.error('Email templates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a template
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id, name, subject, html_content, is_default, type } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults of the same type
    if (is_default && type) {
      await supabase
        .from('email_templates')
        .update({ is_default: false })
        .eq('type', type)
        .eq('is_default', true)
        .neq('id', id);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (html_content !== undefined) updateData.html_content = html_content;
    if (is_default !== undefined) updateData.is_default = is_default;

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      return NextResponse.json(
        { error: 'Failed to update template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ template: data });
  } catch (error) {
    console.error('Email templates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a template
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email templates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

