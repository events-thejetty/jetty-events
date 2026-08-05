// Revenue Settings patch
const DAYS_OF_WEEK = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_LABELS_MAP = {mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday',sat:'Saturday',sun:'Sunday'};
const RS_KEY = 'jetty_revenue_settings';

function loadRevenueSettings() {
  try { return JSON.parse(localStorage.getItem(RS_KEY)) || getDefaultRevenueSettings(); }
  catch(e) { return getDefaultRevenueSettings(); }
}

function getDefaultRevenueSettings() {
  return {
    premium: 1.2,
    targets: {
      mon:{bar:400,restaurant:800,full:1200},
      tue:{bar:400,restaurant:800,full:1200},
      wed:{bar:600,restaurant:1200,full:1800},
      thu:{bar:700,restaurant:1400,full:2100},
      fri:{bar:1200,restaurant:2400,full:3600},
      sat:{bar:1400,restaurant:2800,full:4200},
      sun:{bar:800,restaurant:1600,full:2400},
    }
  };
}

function renderRevenueSettings() {
  const settings = loadRevenueSettings();
  const premEl = document.getElementById('rs-premium');
  if(premEl) premEl.value = String(settings.premium||1.2);
  const tbody = document.getElementById('rs-table-body');
  if(!tbody) return;
  tbody.innerHTML = DAYS_OF_WEEK.map(day => {
    const t = settings.targets[day]||{bar:0,restaurant:0,full:0};
    const prem = settings.premium||1.2;
    const sugBar = Math.round(t.bar*prem);
    const sugRest = Math.round(t.restaurant*prem);
    const sugFull = Math.round(t.full*prem);
    return `<tr style="border-bottom:1px solid var(--sand-border);">
      <td style="padding:8px 12px;font-weight:600;color:var(--ink);">${DAY_LABELS_MAP[day]}</td>
      <td style="padding:8px 12px;text-align:center;"><input type="number" value="${t.bar}" onchange="updateTarget('${day}','bar',this.value)" style="width:80px;padding:4px 6px;border:1px solid var(--sand-border);border-radius:6px;font-size:12px;text-align:center;"/></td>
      <td style="padding:8px 12px;text-align:center;"><input type="number" value="${t.restaurant}" onchange="updateTarget('${day}','restaurant',this.value)" style="width:80px;padding:4px 6px;border:1px solid var(--sand-border);border-radius:6px;font-size:12px;text-align:center;"/></td>
      <td style="padding:8px 12px;text-align:center;"><input type="number" value="${t.full}" onchange="updateTarget('${day}','full',this.value)" style="width:80px;padding:4px 6px;border:1px solid var(--sand-border);border-radius:6px;font-size:12px;text-align:center;"/></td>
      <td style="padding:8px 12px;text-align:center;font-size:11px;color:var(--teal-dark);">
        Bar: $${sugBar.toLocaleString()}<br>Rest: $${sugRest.toLocaleString()}<br>Full: $${sugFull.toLocaleString()}
      </td>
    </tr>`;
  }).join('');
  const ratesEl = document.getElementById('rs-current-rates');
  if(ratesEl && typeof HOURLY !== 'undefined') {
    ratesEl.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr style="background:var(--sand);">
        <th style="padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:var(--muted);">Day group</th>
        <th style="padding:6px 10px;text-align:center;font-size:10px;text-transform:uppercase;color:var(--muted);">Bar/hr</th>
        <th style="padding:6px 10px;text-align:center;font-size:10px;text-transform:uppercase;color:var(--muted);">Restaurant/hr</th>
        <th style="padding:6px 10px;text-align:center;font-size:10px;text-transform:uppercase;color:var(--muted);">Full venue/hr</th>
      </tr></thead>
      <tbody>
        <tr style="border-bottom:1px solid var(--sand-border);"><td style="padding:6px 10px;">Mon–Tue</td><td style="padding:6px 10px;text-align:center;">$${HOURLY.mon.bar}/hr</td><td style="padding:6px 10px;text-align:center;">$${HOURLY.mon.restaurant}/hr</td><td style="padding:6px 10px;text-align:center;">$${HOURLY.mon.full}/hr</td></tr>
        <tr style="border-bottom:1px solid var(--sand-border);"><td style="padding:6px 10px;">Wed–Thu</td><td style="padding:6px 10px;text-align:center;">$${HOURLY.wed.bar}/hr</td><td style="padding:6px 10px;text-align:center;">$${HOURLY.wed.restaurant}/hr</td><td style="padding:6px 10px;text-align:center;">$${HOURLY.wed.full}/hr</td></tr>
        <tr><td style="padding:6px 10px;">Fri–Sun</td><td style="padding:6px 10px;text-align:center;">$${HOURLY.fri.bar}/hr</td><td style="padding:6px 10px;text-align:center;">$${HOURLY.fri.restaurant}/hr</td><td style="padding:6px 10px;text-align:center;">$${HOURLY.fri.full}/hr</td></tr>
      </tbody></table>`;
  }
}

let _pendingSettings = null;
function updateTarget(day, space, value) {
  if(!_pendingSettings) _pendingSettings = loadRevenueSettings();
  if(!_pendingSettings.targets[day]) _pendingSettings.targets[day] = {bar:0,restaurant:0,full:0};
  _pendingSettings.targets[day][space] = parseInt(value)||0;
  renderRevenueSettings();
}

function saveRevenueSettings() {
  const settings = _pendingSettings || loadRevenueSettings();
  const premEl = document.getElementById('rs-premium');
  if(premEl) settings.premium = parseFloat(premEl.value)||1.2;
  localStorage.setItem(RS_KEY, JSON.stringify(settings));
  _pendingSettings = null;
  renderRevenueSettings();
  alert('Revenue settings saved!');
}

function applyToCalculator() {
  const settings = loadRevenueSettings();
  const prem = settings.premium||1.2;
  const t = settings.targets;
  const avg = 3;
  HOURLY.mon = {bar:Math.round((t.mon.bar*prem)/avg),restaurant:Math.round((t.mon.restaurant*prem)/avg),full:Math.round((t.mon.full*prem)/avg)};
  HOURLY.tue = {...HOURLY.mon};
  HOURLY.wed = {bar:Math.round((t.wed.bar*prem)/avg),restaurant:Math.round((t.wed.restaurant*prem)/avg),full:Math.round((t.wed.full*prem)/avg)};
  HOURLY.thu = {...HOURLY.wed};
  HOURLY.fri = {bar:Math.round((t.fri.bar*prem)/avg),restaurant:Math.round((t.fri.restaurant*prem)/avg),full:Math.round((t.fri.full*prem)/avg)};
  HOURLY.sat = {...HOURLY.fri};
  HOURLY.sun = {...HOURLY.fri};
  renderRevenueSettings();
  alert('Pricing calculator rates updated!');
}

// Add Revenue Settings nav item and page to existing app
document.addEventListener('DOMContentLoaded', function() {
  // Add nav item to desktop sidebar
  const recNav = document.querySelector('[onclick*="recurring"]');
  if(recNav) {
    const settingsNav = document.createElement('div');
    settingsNav.className = recNav.className;
    settingsNav.setAttribute('onclick', "showPage('settings',this)");
    settingsNav.innerHTML = '<span class="nav-icon">📊</span><span class="nav-label">Revenue settings</span>';
    recNav.parentNode.insertBefore(settingsNav, recNav.nextSibling);
  }

  // Add settings page
  const mainArea = document.querySelector('.main-area');
  if(mainArea) {
    const settingsPage = document.createElement('div');
    settingsPage.className = 'screen';
    settingsPage.id = 'page-settings';
    settingsPage.innerHTML = `
      <div style="max-width:800px;">
        <div style="margin-bottom:20px;">
          <h2 style="font-size:18px;font-weight:700;color:var(--ink);margin-bottom:4px;">Revenue settings</h2>
          <p style="font-size:12px;color:var(--muted);">Set your average revenue per space per night. The pricing calculator will use these to automatically calculate minimum spends that protect your revenue.</p>
        </div>
        <div style="background:var(--white);border:1px solid var(--sand-border);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:8px;">Premium multiplier</div>
          <div style="display:flex;align-items:center;gap:12px;">
            <label style="font-size:13px;">Premium above break-even:</label>
            <select id="rs-premium" onchange="saveRevenueSettings()" style="padding:6px 10px;border:1px solid var(--sand-border);border-radius:8px;font-size:13px;font-family:var(--font-main);">
              <option value="1.0">0%</option><option value="1.1">10%</option><option value="1.15">15%</option>
              <option value="1.2" selected>20% (recommended)</option><option value="1.25">25%</option>
              <option value="1.3">30%</option><option value="1.5">50%</option>
            </select>
          </div>
        </div>
        <div style="background:var(--white);border:1px solid var(--sand-border);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:4px;">Average revenue per space per night</div>
          <div style="font-size:11px;color:var(--muted);margin-bottom:14px;">Enter what you typically make on a normal trading night for each space.</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead><tr style="background:var(--sand);">
              <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:var(--muted);">Day</th>
              <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:var(--muted);">Bar side</th>
              <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:var(--muted);">Restaurant side</th>
              <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:var(--muted);">Full venue</th>
              <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:var(--muted);">Suggested min spend</th>
            </tr></thead>
            <tbody id="rs-table-body"></tbody>
          </table>
          <div style="margin-top:12px;display:flex;gap:10px;">
            <button class="btn primary" onclick="saveRevenueSettings()">💾 Save settings</button>
            <button class="btn" onclick="applyToCalculator()">⚡ Apply to pricing calculator</button>
          </div>
        </div>
        <div style="background:var(--white);border:1px solid var(--sand-border);border-radius:12px;padding:16px;">
          <div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:8px;">Current calculator rates</div>
          <div id="rs-current-rates"></div>
        </div>
      </div>`;
    mainArea.appendChild(settingsPage);
  }

  // Hook into showPage
  const origShowPage = window.showPage;
  window.showPage = function(id, el) {
    origShowPage(id, el);
    if(id==='settings') renderRevenueSettings();
  };
});
