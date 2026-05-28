(() => {
  'use strict';

  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav__toggle');
  const nav = document.getElementById('primary-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Eligibility quick check
  const eligibilityForm = document.getElementById('eligibilityForm');
  const eligibilityResult = document.getElementById('eligibilityResult');
  if (eligibilityForm && eligibilityResult) {
    eligibilityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(eligibilityForm);
      const lineage = data.get('lineage');
      const restricted = data.get('restricted');
      const passport = data.get('passport');

      eligibilityResult.classList.remove('is-yes', 'is-no');

      if (!lineage || !restricted || !passport) {
        eligibilityResult.textContent = 'Please answer all three questions.';
        eligibilityResult.classList.add('is-no');
        return;
      }

      if (lineage === 'yes' && restricted === 'no' && passport === 'yes') {
        eligibilityResult.innerHTML =
          '<strong>You appear eligible.</strong> Continue with a new OCI application — we\'ll confirm details as you go.';
        eligibilityResult.classList.add('is-yes');
      } else {
        let why = '';
        if (lineage === 'no') why = 'OCI requires Indian-origin lineage (you, parents, or grandparents).';
        else if (restricted === 'yes') why = 'Citizens of Pakistan or Bangladesh are not eligible for OCI.';
        else if (passport === 'no') why = 'A valid foreign passport is required to apply.';
        eligibilityResult.innerHTML =
          '<strong>Not eligible based on your answers.</strong> ' + why +
          ' See <a href="#eligibility">full criteria</a> or contact the helpdesk.';
        eligibilityResult.classList.add('is-no');
      }
    });
  }

  // Mock status tracker
  const statusForm = document.getElementById('statusForm');
  const statusResult = document.getElementById('statusResult');
  if (statusForm && statusResult) {
    statusForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(statusForm);
      const fileNo = (data.get('fileNo') || '').toString().trim();
      const dob = data.get('dob');

      if (!fileNo || !dob) {
        statusResult.classList.add('is-visible');
        statusResult.innerHTML = '<p style="margin:0;color:#7a1c1c">Please enter both the file number and date of birth.</p>';
        return;
      }

      // Demo response — in production this would call an API
      const submitted = new Date();
      submitted.setDate(submitted.getDate() - 12);
      const eta = new Date();
      eta.setDate(eta.getDate() + 18);

      const fmt = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      statusResult.classList.add('is-visible');
      statusResult.innerHTML = `
        <h4>Application <strong>${escapeHtml(fileNo)}</strong></h4>
        <p style="margin:0 0 12px;color:#36465c;font-size:14px;">
          Submitted: <strong>${fmt(submitted)}</strong> · Estimated completion: <strong>${fmt(eta)}</strong>
        </p>
        <ul class="stages">
          <li data-state="done"><span class="dot"></span><span>Application received</span><span>${fmt(submitted)}</span></li>
          <li data-state="done"><span class="dot"></span><span>Documents verified at mission</span><span>${fmt(new Date(submitted.getTime() + 4 * 864e5))}</span></li>
          <li data-state="active"><span class="dot"></span><span>Under review at MHA, New Delhi</span><span>In progress</span></li>
          <li data-state="pending"><span class="dot"></span><span>Printing &amp; despatch</span><span>—</span></li>
          <li data-state="pending"><span class="dot"></span><span>Delivered</span><span>—</span></li>
        </ul>
      `;
    });
  }

  // Simple rotating alerts ticker
  const ticker = document.getElementById('alertTicker');
  if (ticker) {
    const items = Array.from(ticker.children);
    if (items.length > 1) {
      items.forEach((li, i) => { li.style.display = i === 0 ? 'block' : 'none'; });
      let idx = 0;
      setInterval(() => {
        items[idx].style.display = 'none';
        idx = (idx + 1) % items.length;
        items[idx].style.display = 'block';
      }, 5000);
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }
})();
