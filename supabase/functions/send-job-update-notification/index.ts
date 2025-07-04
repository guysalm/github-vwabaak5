import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobUpdateNotificationRequest {
  jobId: string
  jobTitle: string
  fieldName: string
  oldValue: string | null
  newValue: string | null
  updatedBy: string
  customerName: string
  customerAddress: string
  subcontractorName: string
  jobStatus: string
  jobPrice?: number | null
  jobMaterials?: string | null
  jobNotes?: string | null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      jobId, 
      jobTitle, 
      fieldName, 
      oldValue, 
      newValue, 
      updatedBy, 
      customerName,
      customerAddress,
      subcontractorName,
      jobStatus,
      jobPrice,
      jobMaterials,
      jobNotes
    }: JobUpdateNotificationRequest = await req.json()

    // Format field name for display
    const formatFieldName = (field: string): string => {
      const fieldMap: { [key: string]: string } = {
        'status': 'Job Status',
        'materials': 'Materials Used',
        'price': 'Sale Price',
        'parts_cost': 'Parts Cost',
        'job_profit': 'Job Profit',
        'notes': 'Work Notes',
        'receipt_url': 'Receipt Upload'
      }
      return fieldMap[field] || field.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }

    // Format values for display
    const formatValue = (value: string | null, field: string): string => {
      if (!value || value === 'null') return 'Empty'
      
      if (field === 'price' || field === 'parts_cost' || field === 'job_profit') {
        const num = parseFloat(value)
        return isNaN(num) ? value : `$${num.toFixed(2)}`
      }
      
      if (field === 'status') {
        return value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')
      }
      
      if (value.length > 100) {
        return value.substring(0, 100) + '...'
      }
      
      return value
    }

    // Get change description
    const getChangeDescription = (field: string, oldVal: string | null, newVal: string | null): string => {
      const fieldName = formatFieldName(field)
      const oldFormatted = formatValue(oldVal, field)
      const newFormatted = formatValue(newVal, field)
      
      if (!oldVal || oldVal === 'null') {
        return `${fieldName} was set to: ${newFormatted}`
      } else if (!newVal || newVal === 'null') {
        return `${fieldName} was cleared (was: ${oldFormatted})`
      } else {
        return `${fieldName} was changed from "${oldFormatted}" to "${newFormatted}"`
      }
    }

    // Create email content
    const subject = `🔧 Job Update: ${jobTitle} - ${formatFieldName(fieldName)} Changed`
    
    const changeDescription = getChangeDescription(fieldName, oldValue, newValue)
    
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
            🔧 Job Update Notification
          </h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
            ${jobTitle}
          </p>
        </div>
        
        <!-- Main Content -->
        <div style="background-color: white; padding: 30px; margin: 0;">
          <!-- Change Alert -->
          <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <h2 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
              📝 What Changed
            </h2>
            <p style="color: #1e40af; margin: 0; font-size: 16px; font-weight: 500;">
              ${changeDescription}
            </p>
          </div>
          
          <!-- Job Details -->
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
              📋 Job Information
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500; width: 30%;">Customer:</td>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Address:</td>
                <td style="padding: 8px 0; color: #374151;">${customerAddress}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Subcontractor:</td>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">${subcontractorName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                    ${jobStatus.replace('_', ' ')}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Updated by:</td>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">${updatedBy}</td>
              </tr>
            </table>
          </div>
          
          <!-- Current Job Summary -->
          <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
              💼 Current Job Summary
            </h3>
            <div style="display: grid; gap: 10px;">
              ${jobPrice ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0f2fe;">
                  <span style="color: #0369a1; font-weight: 500;">Sale Price:</span>
                  <span style="color: #065f46; font-weight: 600; font-size: 16px;">$${jobPrice.toFixed(2)}</span>
                </div>
              ` : ''}
              ${jobMaterials ? `
                <div style="padding: 8px 0; border-bottom: 1px solid #e0f2fe;">
                  <span style="color: #0369a1; font-weight: 500; display: block; margin-bottom: 5px;">Materials Used:</span>
                  <span style="color: #374151; background-color: white; padding: 8px; border-radius: 4px; display: block;">${jobMaterials}</span>
                </div>
              ` : ''}
              ${jobNotes ? `
                <div style="padding: 8px 0;">
                  <span style="color: #0369a1; font-weight: 500; display: block; margin-bottom: 5px;">Work Notes:</span>
                  <span style="color: #374151; background-color: white; padding: 8px; border-radius: 4px; display: block;">${jobNotes}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://your-domain.com'}/admin/job/${jobId}" 
               style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
              🔍 View Full Job Details
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
            This is an automated notification from your Job Management System
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Sent at ${new Date().toLocaleString('en-US', { 
              timeZone: 'America/New_York',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} EST
          </p>
        </div>
      </div>
    `

    // In a real implementation, you would use a service like SendGrid, Resend, or similar
    // For now, we'll log the email content and return success
    console.log('📧 Email notification would be sent:', {
      to: 'admin@company.com', // This would come from your admin settings
      subject,
      htmlContent: htmlContent.substring(0, 200) + '...',
      timestamp: new Date().toISOString(),
      jobId,
      fieldChanged: fieldName,
      updatedBy
    })

    // Mock email sending - replace with actual email service
    const emailSent = true // This would be the result of your email service call

    if (emailSent) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email notification sent successfully',
          fieldChanged: formatFieldName(fieldName),
          changeDescription
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      throw new Error('Failed to send email')
    }

  } catch (error) {
    console.error('❌ Error sending email notification:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email notification'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})