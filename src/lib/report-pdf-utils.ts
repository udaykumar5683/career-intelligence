import type { AnalysisResults } from '@/types/analysis';

export function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'Low': return '#10b981';
    case 'Medium': return '#f59e0b';
    case 'High': return '#ef4444';
    default: return '#6b7280';
  }
}

export function getImportanceColor(importance: string): string {
  switch (importance) {
    case 'Critical': return '#ef4444';
    case 'Important': return '#f59e0b';
    case 'Nice to Have': return '#10b981';
    default: return '#6b7280';
  }
}

export function generateReportHTML(results: AnalysisResults): string {
  const { profile, jobRoles, marketResearch, skillGaps, placementRisk, salaryEstimates, roadmap } = results;
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
  <style>
    .pdf-report { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; background: #ffffff; line-height: 1.5; padding: 40px; }
    .pdf-container { max-width: 800px; margin: 0 auto; }
    .pdf-header { background: #0d9488; color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .pdf-header h1 { font-size: 24px; font-weight: 700; margin-bottom: 5px; color: white; }
    .pdf-header .subtitle { font-size: 14px; opacity: 0.9; }
    .pdf-header .date { font-size: 12px; opacity: 0.8; margin-top: 10px; }
    .pdf-section { margin-bottom: 25px; page-break-inside: avoid; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
    .pdf-section h2 { font-size: 18px; font-weight: 700; color: #0d9488; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #f3f4f6; }
    .pdf-section h3 { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 10px; }
    .pdf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .pdf-info-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; }
    .pdf-info-label { color: #6b7280; font-size: 12px; font-weight: 500; }
    .pdf-info-value { color: #111827; font-weight: 600; font-size: 12px; text-align: right; }
    .pdf-tag { display: inline-block; background: #f0fdfa; color: #0d9488; border: 1px solid #ccfbf1; border-radius: 4px; padding: 2px 8px; font-size: 11px; margin: 2px 4px 2px 0; }
    .pdf-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; }
    .pdf-badge-low { background: #10b981; }
    .pdf-badge-medium { background: #f59e0b; }
    .pdf-badge-high { background: #ef4444; }
    .pdf-progress-bar { background: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden; margin-top: 4px; }
    .pdf-progress-fill { height: 100%; border-radius: 4px; }
    .pdf-role-card { background: #f9fafb; border-radius: 6px; padding: 15px; margin-bottom: 12px; border-left: 4px solid #0d9488; }
    .pdf-skill-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .pdf-salary-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .pdf-salary-table th, .pdf-salary-table td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    .pdf-salary-table th { background: #f0fdfa; color: #0d9488; font-weight: 700; }
    .pdf-roadmap-phase { border-left: 3px solid #0d9488; padding-left: 15px; margin-bottom: 15px; }
    .pdf-footer { text-align: center; color: #9ca3af; font-size: 10px; margin-top: 30px; padding: 20px; border-top: 1px solid #e5e7eb; }
    .pdf-text-small { font-size: 12px; color: #4b5563; }
    .pdf-strength { color: #059669; font-weight: 500; }
    .pdf-weakness { color: #dc2626; font-weight: 500; }
  </style>
  <div class="pdf-report">
    <div class="pdf-container">
      <div class="pdf-header">
        <h1>Career Intelligence Report</h1>
        <div class="subtitle">AI-Powered Placement Risk & Career Analysis</div>
        <div class="date">Generated on ${now}</div>
      </div>

      <!-- Profile Section -->
      <div class="pdf-section">
        <h2>Profile Overview</h2>
        <div class="pdf-grid">
          <div>
            <div class="pdf-info-row"><span class="pdf-info-label">Name</span><span class="pdf-info-value">${profile.name || 'N/A'}</span></div>
            <div class="pdf-info-row"><span class="pdf-info-label">Email</span><span class="pdf-info-value">${profile.email || 'N/A'}</span></div>
            <div class="pdf-info-row"><span class="pdf-info-label">Phone</span><span class="pdf-info-value">${profile.phone || 'N/A'}</span></div>
            <div class="pdf-info-row"><span class="pdf-info-label">Location</span><span class="pdf-info-value">${profile.location || 'N/A'}</span></div>
          </div>
          <div>
            ${profile.summary ? `<div style="margin-bottom: 10px;"><span class="pdf-info-label">Summary</span><p class="pdf-text-small" style="margin-top: 4px;">${profile.summary}</p></div>` : ''}
          </div>
        </div>
        ${profile.skills.length > 0 ? `<div style="margin-top: 15px;"><span class="pdf-info-label">Skills</span><div style="margin-top: 5px;">${profile.skills.map(s => `<span class="pdf-tag">${s}</span>`).join('')}</div></div>` : ''}
        ${profile.education.length > 0 ? `<div style="margin-top: 15px;"><span class="pdf-info-label">Education</span>${profile.education.map(e => `<div class="pdf-text-small" style="margin-top: 4px;"><strong>${e.degree}</strong> &mdash; ${e.institution} ${e.year ? `(${e.year})` : ''}</div>`).join('')}</div>` : ''}
      </div>

      <!-- Placement Risk Section -->
      <div class="pdf-section">
        <h2>Placement Risk Assessment</h2>
        <div class="pdf-grid">
          <div style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div style="font-size: 42px; font-weight: 800; color: ${getRiskColor(placementRisk.overallRisk)};">${placementRisk.overallScore}</div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Overall Score</div>
            <span class="pdf-badge pdf-badge-${placementRisk.overallRisk.toLowerCase()}">${placementRisk.overallRisk} Risk</span>
          </div>
          <div>
            <div class="pdf-info-row"><span class="pdf-info-label">Within 3 months</span><span class="pdf-info-value">${placementRisk.withinThreeMonths}%</span></div>
            <div class="pdf-progress-bar"><div class="pdf-progress-fill" style="width: ${placementRisk.withinThreeMonths}%; background: ${getRiskColor(placementRisk.overallRisk)};"></div></div>
            <div class="pdf-info-row" style="margin-top: 8px;"><span class="pdf-info-label">Within 6 months</span><span class="pdf-info-value">${placementRisk.withinSixMonths}%</span></div>
            <div class="pdf-progress-bar"><div class="pdf-progress-fill" style="width: ${placementRisk.withinSixMonths}%; background: ${getRiskColor(placementRisk.overallRisk)};"></div></div>
            <div class="pdf-info-row" style="margin-top: 8px;"><span class="pdf-info-label">Within 12 months</span><span class="pdf-info-value">${placementRisk.withinTwelveMonths}%</span></div>
            <div class="pdf-progress-bar"><div class="pdf-progress-fill" style="width: ${placementRisk.withinTwelveMonths}%; background: ${getRiskColor(placementRisk.overallRisk)};"></div></div>
          </div>
        </div>
        ${placementRisk.explanation ? `<p class="pdf-text-small" style="margin-top: 15px; border-top: 1px solid #f3f4f6; pt: 10px;">${placementRisk.explanation}</p>` : ''}
        <div class="pdf-grid" style="margin-top: 15px;">
          <div><h3>Strengths</h3>${placementRisk.strengths.map(s => `<div class="pdf-text-small pdf-strength" style="padding: 2px 0;">&bull; ${s}</div>`).join('')}</div>
          <div><h3>Weaknesses</h3>${placementRisk.weaknesses.map(w => `<div class="pdf-text-small pdf-weakness" style="padding: 2px 0;">&bull; ${w}</div>`).join('')}</div>
        </div>
      </div>

      <!-- Job Roles Section -->
      <div class="pdf-section">
        <h2>Recommended Job Roles</h2>
        ${jobRoles.length > 0 ? jobRoles.map(role => `
          <div class="pdf-role-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <h3>${role.role}</h3>
              <span class="pdf-badge pdf-badge-${role.matchScore >= 70 ? 'low' : role.matchScore >= 40 ? 'medium' : 'high'}">${role.matchScore}% Match</span>
            </div>
            <p class="pdf-text-small" style="margin-bottom: 8px;">${role.reason}</p>
            <div style="font-size: 11px; color: #6b7280;">Growth: ${role.growthPotential} | Skills: ${role.requiredSkills.slice(0, 5).join(', ')}${role.requiredSkills.length > 5 ? '...' : ''}</div>
          </div>
        `).join('') : '<p class="pdf-text-small">No recommendations available.</p>'}
      </div>

      <!-- Skill Gaps Section -->
      <div class="pdf-section">
        <h2>Skill Gap Analysis</h2>
        ${skillGaps.length > 0 ? skillGaps.map(sg => `
          <div class="pdf-skill-row">
            <div class="pdf-text-small" style="font-weight: 600;">
              ${sg.skill}
              <span style="font-size: 10px; color: ${getImportanceColor(sg.importance)}; margin-left: 5px;">[${sg.importance}]</span>
            </div>
            <div style="text-align: right; font-size: 10px; color: #6b7280;">
              ${sg.category} &bull; ${sg.estimatedTimeToLearn}
            </div>
          </div>
        `).join('') : '<p class="pdf-text-small">No skill gaps identified.</p>'}
      </div>

      <!-- Salary Section -->
      <div class="pdf-section">
        <h2>Salary Estimates</h2>
        ${salaryEstimates.length > 0 ? salaryEstimates.map(se => `
          <h3>${se.role}</h3>
          <table class="pdf-salary-table">
            <thead><tr><th>Level</th><th>Min</th><th>Median</th><th>Max</th></tr></thead>
            <tbody>
              <tr><td>Entry</td><td>${formatCurrency(se.entryLevel.min, se.currency)}</td><td>${formatCurrency(se.entryLevel.median, se.currency)}</td><td>${formatCurrency(se.entryLevel.max, se.currency)}</td></tr>
              <tr><td>Mid</td><td>${formatCurrency(se.midLevel.min, se.currency)}</td><td>${formatCurrency(se.midLevel.median, se.currency)}</td><td>${formatCurrency(se.midLevel.max, se.currency)}</td></tr>
              <tr><td>Senior</td><td>${formatCurrency(se.seniorLevel.min, se.currency)}</td><td>${formatCurrency(se.seniorLevel.median, se.currency)}</td><td>${formatCurrency(se.seniorLevel.max, se.currency)}</td></tr>
            </tbody>
          </table>
        `).join('<div style="margin: 15px 0;"></div>') : '<p class="pdf-text-small">No data available.</p>'}
      </div>

      <!-- Career Roadmap Section -->
      <div class="pdf-section">
        <h2>Career Roadmap</h2>
        ${roadmap.length > 0 ? roadmap.map(step => `
          <div class="pdf-roadmap-phase">
            <div style="font-weight: 700; color: #0d9488; font-size: 13px;">Phase ${step.phase}: ${step.title} (${step.duration})</div>
            <div style="font-size: 11px; margin-bottom: 5px;">Milestone: ${step.milestone}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${step.tasks.slice(0, 4).map(t => `<div class="pdf-text-small" style="width: 100%;">&bull; ${t}</div>`).join('')}
            </div>
          </div>
        `).join('') : '<p class="pdf-text-small">No roadmap available.</p>'}
      </div>

      <div class="pdf-footer">
        <p>Career Intelligence Report &mdash; Generated by AI Placement Risk & Career Intelligence Platform</p>
        <p>This report is based on AI analysis and should be used as guidance only. ${now}</p>
      </div>
    </div>
  </div>`;
}

export async function downloadPDF(results: AnalysisResults, toast: any) {
  try {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    const htmlContent = generateReportHTML(results);
    
    // Create an iframe to isolate styles and prevent html2canvas from parsing global CSS with lab/oklch colors
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '800px';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) throw new Error('Could not create iframe document');

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { margin: 0; padding: 0; background: white; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Give it a moment to render and fonts to load
    await new Promise(resolve => setTimeout(resolve, 500));

    const reportElement = iframeDoc.querySelector('.pdf-report');
    if (!reportElement) throw new Error('Report element not found in iframe');

    const canvas = await html2canvas(reportElement as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(`career-report-${results.profile.name.replace(/\s+/g, '-').toLowerCase() || 'analysis'}.pdf`);
    
    document.body.removeChild(iframe);
    toast.success('PDF report generated successfully');
  } catch (error) {
    console.error('PDF generation failed:', error);
    toast.error('Failed to generate PDF report. Please try again.');
  }
}
