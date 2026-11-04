(() => {
  'use strict';
  const content = document.getElementById('catalogue-content');
  const detail = document.getElementById('product-detail');
  const language = document.getElementById('language');
  const tabs = [...document.querySelectorAll('[data-collection]')];
  const state = { metal: 'gold', lang: 'en', search: '', category: '', subcategory: '', type: '', gender: '', purity: '' };
  const groupNames = {
    jewellery: { en: 'Jewellery', hi: 'आभूषण', hinglish: 'Jewellery' },
    coins: { en: 'Silver Coins', hi: 'चांदी के सिक्के', hinglish: 'Silver Coins' },
    pooja: { en: 'Silver Pooja Items', hi: 'चांदी की पूजा सामग्री', hinglish: 'Silver Pooja Items' },
    bartan: { en: 'Silver Bartan', hi: 'चांदी के बर्तन', hinglish: 'Silver Bartan' }
  };
  const typeNames = {
    traditional: {en:'Traditional',hi:'पारंपरिक',hinglish:'Traditional'}, modern: {en:'Modern',hi:'आधुनिक',hinglish:'Modern'}, antique: {en:'Antique',hi:'एंटीक',hinglish:'Antique'}, designer: {en:'Designer',hi:'डिज़ाइनर',hinglish:'Designer'}, bridal: {en:'Bridal',hi:'दुल्हन',hinglish:'Bridal'}, daily: {en:'Daily wear',hi:'रोज़ पहनने के लिए',hinglish:'Daily wear'}
  };
  const genderNames = {women:'Women',men:'Men',children:'Children',unisex:'Unisex'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const norm = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase().trim();
  const local = value => value?.[state.lang] || value?.en || '';
  const allNames = value => Object.values(value || {}).join(' ');
  const options = (items, selected, placeholder) => `<option value="">${esc(placeholder)}</option>` + items.map(([value,label]) => `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(label)}</option>`).join('');
  const phoneDigits = value => /^\+?[1-9]\d{7,14}$/.test(String(value || '').replace(/[\s()-]/g,'')) ? String(value).replace(/\D/g,'') : '';
  const safeImage = path => /^(assets|catalogue)\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp|avif)$/i.test(path || '') && !path.includes('..') ? path : '';
  let data;
  function cat(id) { return data.categories.find(item => item.id === id); }
  function catName(id) { return local(cat(id)?.names) || id; }
  function queryText(product) { return norm([product.id, allNames(product.names), allNames(product.subcategory), allNames(cat(product.category)?.names), product.description, ...(product.designTypes || []).flatMap(id => Object.values(typeNames[id] || {}))].join(' ')); }
  function message(product, extra = '') { return `Hello, I would like to enquire about ${local(product.names)} (${catName(product.category)}), reference ${product.id}.${extra ? '\n' + extra : ''}`; }
  function whatsapp(product, extra = '') { const number = phoneDigits(data.contact?.whatsapp); return number ? `https://wa.me/${number}?text=${encodeURIComponent(message(product, extra))}` : ''; }
  function credit(product) {
    const c = product.credit;
    if (!c || !/^https:\/\//.test(c.url || '') || !/^https:\/\//.test(c.licenseUrl || '')) return '';
    return `<p class="photo-credit">Photo: <a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.title)} by ${esc(c.creator)}</a> · <a href="${esc(c.licenseUrl)}" target="_blank" rel="noopener">${esc(c.license)}</a>. ${esc(c.changes)}</p>`;
  }
  function card(product) {
    const image = safeImage(product.images?.[0]);
    const wa = whatsapp(product);
    return `<article class="catalogue-card"><a class="product-image" href="?product=${encodeURIComponent(product.id)}" aria-label="View ${esc(local(product.names))} details">${image ? `<img src="${esc(image)}" alt="${esc(local(product.names))} ${product.referenceOnly ? 'design reference' : ''}" loading="lazy">` : ''}<span class="product-tag">${esc(product.metal.toUpperCase())}${product.referenceOnly ? ' · REFERENCE' : ''}</span></a><h3><a href="?product=${encodeURIComponent(product.id)}">${esc(local(product.names))}</a></h3><div class="card-meta">${esc(catName(product.category))} · ${esc(local(product.subcategory))} · ${esc(product.id)}</div>${product.purity ? `<p>Purity: ${esc(product.purity)}</p>` : ''}${product.weight ? `<p>Weight: ${esc(product.weight)}</p>` : ''}<p>${esc(product.description)}</p>${credit(product)}<div class="catalogue-actions"><a href="?product=${encodeURIComponent(product.id)}" data-detail="${esc(product.id)}">View details ↗</a>${wa ? `<a class="secondary" href="${esc(wa)}" target="_blank" rel="noopener">Enquire on WhatsApp</a>` : '<button class="secondary" disabled title="Business WhatsApp number is not configured">WhatsApp unavailable</button>'}</div></article>`;
  }
  function selectField(label, key, items, placeholder) { return `<label class="control-label">${label}<select data-field="${key}">${options(items, state[key], placeholder)}</select></label>`; }
  function renderTabs() {
    const labels = {gold:{en:'Gold Jewellery',hi:'सोने के आभूषण',hinglish:'Gold Jewellery'},silver:{en:'Silver Jewellery',hi:'चांदी के आभूषण',hinglish:'Silver Jewellery'}};
    tabs.forEach(tab => { tab.textContent = `${tab.dataset.collection === 'gold' ? '✦' : '✧'}  ${local(labels[tab.dataset.collection])}`; tab.setAttribute('aria-pressed', String(tab.dataset.collection === state.metal)); });
  }
  function buildList() {
    const categories = data.categories.filter(c => c.metals.includes(state.metal));
    const visibleProducts = data.products.filter(p => p.published && p.metal === state.metal);
    const subcategories = [...new Map(visibleProducts.filter(p => p.subcategory).map(p => [p.subcategory.en, p.subcategory])).values()].map(s => [s.en, local(s)]);
    const purities = [...new Set(visibleProducts.map(p => p.purity).filter(Boolean))].map(p => [p,p]);
    content.innerHTML = `<div class="catalogue-layout"><aside class="catalogue-sidebar"><h3>Browse categories</h3><div id="category-groups"></div></aside><div class="catalogue-main"><div class="filter-grid"><label class="control-label search-field">Search in English, हिन्दी or Hinglish<input type="search" data-field="search" placeholder="Try Payal, पायल or Anklet" value="${esc(state.search)}"></label>${selectField('Category','category',categories.map(c => [c.id,local(c.names)]),'All categories')}${selectField('Subcategory','subcategory',subcategories,'All subcategories')}${selectField('Jewellery type','type',Object.entries(typeNames).map(([id,names])=>[id,local(names)]),'All styles')}${selectField('Gender','gender',Object.entries(genderNames),'All genders')}${selectField('Purity','purity',purities,'All purities')}</div><div class="filter-bottom"><span class="results-count" id="results-count" aria-live="polite"></span><button class="clear-filters" type="button">Clear filters</button></div><p class="catalogue-disclaimer">Items marked reference are design inspiration, not confirmed stock. Please ask the store about materials and availability.</p><div id="results" class="catalogue-products"></div><div id="empty" class="empty-state" hidden>No items match these filters yet. Ask the store about this category.</div></div></div>`;
    content.querySelectorAll('[data-field]').forEach(field => field.addEventListener(field.tagName === 'INPUT' ? 'input' : 'change', () => { state[field.dataset.field] = field.value; updateResults(); }));
    content.querySelector('.clear-filters').addEventListener('click', () => { Object.assign(state,{search:'',category:'',subcategory:'',type:'',gender:'',purity:''}); buildList(); });
    updateResults();
  }
  function updateResults() {
    const search = norm(state.search);
    const groups = Object.keys(groupNames).map(group => {
      const categories = data.categories.filter(c => c.group === group && c.metals.includes(state.metal) && (!search || norm(allNames(c.names)).includes(search)));
      return categories.length ? `<div class="category-group"><h4>${esc(local(groupNames[group]))}</h4><div class="category-list">${categories.map(c => `<button class="category-chip" type="button" data-category="${esc(c.id)}" aria-pressed="${c.id === state.category}">${esc(local(c.names))}</button>`).join('')}</div></div>` : '';
    }).join('');
    content.querySelector('#category-groups').innerHTML = groups || '<p class="results-count">No matching categories.</p>';
    content.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => { state.category = state.category === button.dataset.category ? '' : button.dataset.category; state.search = ''; buildList(); }));
    const results = data.products.filter(p => p.published && p.metal === state.metal && (!search || queryText(p).includes(search)) && (!state.category || p.category === state.category || p.additionalCategories?.includes(state.category)) && (!state.subcategory || p.subcategory?.en === state.subcategory) && (!state.type || p.designTypes?.includes(state.type)) && (!state.gender || p.gender === state.gender) && (!state.purity || p.purity === state.purity));
    content.querySelector('#results').innerHTML = results.map(card).join('');
    content.querySelector('#empty').hidden = results.length > 0;
    content.querySelector('#results-count').textContent = `${results.length} item${results.length === 1 ? '' : 's'}`;
  }
  function renderDetail(product) {
    const images = (product.images || []).map(safeImage).filter(Boolean), wa = whatsapp(product), phone = phoneDigits(data.contact?.phone);
    detail.innerHTML = `<button type="button" class="detail-back">← Back to collection</button><div class="detail-grid"><div><div class="detail-image">${images[0] ? `<img src="${esc(images[0])}" alt="${esc(local(product.names))} ${product.referenceOnly ? 'design reference' : ''}">` : ''}</div>${images.length > 1 ? `<div class="detail-images">${images.slice(1).map(src => `<img src="${esc(src)}" alt="${esc(local(product.names))} additional view">`).join('')}</div>` : ''}</div><div class="detail-copy"><div class="eyebrow">${esc(product.metal.toUpperCase())} COLLECTION · ${esc(product.id)}</div><h2>${esc(local(product.names))}</h2><p>${esc(product.description)}</p>${product.referenceOnly ? '<p>Design reference only. Please confirm materials and availability with the store.</p>' : ''}${credit(product)}<dl class="detail-specs"><div><dt>Names</dt><dd>${esc(product.names.en)} / ${esc(product.names.hi)} / ${esc(product.names.hinglish)}</dd></div><div><dt>Category</dt><dd>${esc(catName(product.category))}</dd></div><div><dt>Subcategory</dt><dd>${esc(local(product.subcategory))}</dd></div>${product.purity ? `<div><dt>Purity</dt><dd>${esc(product.purity)}</dd></div>` : ''}${product.weight ? `<div><dt>Weight</dt><dd>${esc(product.weight)}</dd></div>` : ''}<div><dt>Design variations</dt><dd>${product.variations?.length ? esc(product.variations.join(', ')) : 'Ask the store'}</dd></div></dl><div class="detail-actions"><a href="#enquiry-form">Enquire now</a>${wa ? `<a class="secondary" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp enquiry</a>` : '<button class="secondary" disabled>WhatsApp unavailable</button>'}${phone ? `<a class="secondary" href="tel:+${phone}">Call the store</a>` : '<button class="secondary" disabled>Phone unavailable</button>'}</div><form id="enquiry-form" class="enquiry-form"><h3>Enquire about this design</h3><p>Reference ${esc(product.id)} · ${esc(local(product.names))} · ${esc(catName(product.category))}</p><label>Your name <input name="name" autocomplete="name" required></label><label>Your phone number <input name="phone" type="tel" autocomplete="tel" required></label><label>Message <textarea name="message" placeholder="Tell us what you are looking for"></textarea></label>${wa ? '<button type="submit">Continue to WhatsApp</button>' : '<p>The store’s WhatsApp number has not been provided. You can copy your enquiry for now.</p><button type="submit">Copy enquiry</button>'}<span class="form-status" role="status"></span></form></div></div>`;
    detail.querySelector('.detail-back').addEventListener('click', () => { history.pushState({}, '', 'catalogue.html'); showPage(); });
    detail.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget, fields = new FormData(form);
      const extra = `Name: ${fields.get('name')}\nPhone: ${fields.get('phone')}\nMessage: ${fields.get('message') || 'Please share more details.'}`;
      if (wa) { window.open(whatsapp(product, extra), '_blank', 'noopener'); return; }
      try { await navigator.clipboard.writeText(message(product, extra)); form.querySelector('.form-status').textContent = 'Enquiry copied. Contact the store to share it.'; }
      catch { form.querySelector('.form-status').textContent = 'Could not copy the enquiry. Please copy the reference above.'; }
    });
  }
  function showPage() {
    const id = new URLSearchParams(location.search).get('product');
    const product = id && data.products.find(p => p.id === id && p.published);
    if (id) {
      content.hidden = true; detail.hidden = false;
      if (product) { state.metal = product.metal; renderTabs(); renderDetail(product); }
      else detail.innerHTML = '<p class="empty-state">This product was not found. <a href="catalogue.html">Return to the collection</a>.</p>';
    } else { content.hidden = false; detail.hidden = true; renderTabs(); buildList(); }
  }
  tabs.forEach(tab => tab.addEventListener('click', () => { state.metal = tab.dataset.collection; Object.assign(state,{search:'',category:'',subcategory:'',type:'',gender:'',purity:''}); if (location.search) history.pushState({},'', 'catalogue.html'); showPage(); }));
  language.addEventListener('change', () => { state.lang = language.value; try { localStorage.setItem('om-catalogue-language', state.lang); } catch {} showPage(); });
  window.addEventListener('popstate', showPage);
  fetch('catalogue/data.json').then(response => { if (!response.ok) throw new Error('Catalogue unavailable'); return response.json(); }).then(result => {
    data = result;
    try { const saved = localStorage.getItem('om-catalogue-language'); if (['en','hi','hinglish'].includes(saved)) state.lang = saved; } catch {}
    language.value = state.lang; showPage();
  }).catch(() => { content.innerHTML = '<p class="catalogue-loading-error">The catalogue could not be loaded. Please try again later.</p>'; });
})();
