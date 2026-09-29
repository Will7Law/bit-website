/* Extracted from pages/programme-detail.html (inline block #1).
   Moved out of the HTML so the page CSP can enforce
   script-src 'self' without 'unsafe-inline'.
   NDMA security assessment, 10 July 2026, Finding 4. */
// Programme data store
  const programmes = {
    electrical: {
      title: "Electrical Installation & Maintenance",
      tagline: "Master residential and commercial electrical systems with nationally recognised certification.",
      icon: "fa-bolt", color: "#FF6B35",
      overview: "The Electrical Installation & Maintenance programme provides comprehensive training in residential and commercial electrical wiring, circuit design, maintenance protocols, and safety compliance. Trainees learn to read electrical blueprints, install wiring systems, troubleshoot faults, and comply with national electrical codes. The programme combines classroom theory with extensive hands-on workshop practice using industry-standard tools and equipment.",
      duration: "12 Months", intake: "January & July", certification: "BIT Electrical Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 2, 3, 4, 5, 6, 10",
      curriculum: ["Electrical Safety & Regulations","Basic Electrical Theory & Mathematics","Residential Wiring Systems","Commercial & Industrial Wiring","Circuit Design & Blueprint Reading","Electrical Testing & Troubleshooting","Motor Controls & Power Distribution","Solar PV Systems (Introduction)","Workshop Practice & Assessment"],
      outcomes: ["Install and maintain residential and commercial electrical systems safely","Read and interpret electrical blueprints and circuit diagrams","Perform electrical testing, fault diagnosis and repair","Apply national electrical codes and safety standards","Work with motor controls and power distribution systems"],
      careers: ["Electrician","Electrical Contractor","Maintenance Technician","Solar PV Installer","Building Services Engineer","Industrial Electrician"]
    },
    plumbing: {
      title: "Plumbing & Pipefitting",
      tagline: "Learn professional plumbing installation and maintenance for residential and commercial buildings.",
      icon: "fa-faucet", color: "#2C8C99",
      overview: "The Plumbing & Pipefitting programme trains students in the design, installation, and maintenance of water supply and drainage systems. Trainees gain expertise in pipe cutting, soldering, brazing, and threading, as well as fixture installation and building code compliance. The programme covers both residential and commercial plumbing systems with extensive practical workshop sessions.",
      duration: "12 Months", intake: "January & July", certification: "BIT Plumbing Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 6",
      curriculum: ["Plumbing Safety & Building Codes","Water Supply Systems","Drainage & Waste Systems","Pipe Cutting, Threading & Soldering","Fixture Installation","Hot Water Systems","Pump Installation & Maintenance","Blueprint Reading for Plumbing","Workshop Practice & Assessment"],
      outcomes: ["Install complete water supply and drainage systems","Read plumbing blueprints and building specifications","Perform pipe cutting, soldering, brazing and threading","Install and maintain plumbing fixtures and appliances","Comply with local building codes and regulations"],
      careers: ["Plumber","Pipefitter","Maintenance Plumber","Plumbing Contractor","Building Maintenance Technician","Water Systems Technician"]
    },
    welding: {
      title: "Welding & Fabrication",
      tagline: "Industry-standard welding techniques for construction, manufacturing, and industrial applications.",
      icon: "fa-fire", color: "#C62828",
      overview: "The Welding & Fabrication programme provides intensive training in multiple welding processes including Arc (SMAW), MIG (GMAW), and TIG (GTAW) techniques. Trainees learn metal fabrication, blueprint reading, and structural welding for industrial and construction applications. With Guyana's booming oil and gas sector, demand for certified welders is at an all-time high.",
      duration: "12 Months", intake: "January & July", certification: "BIT Welding Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 6, 10",
      curriculum: ["Welding Safety & PPE","Arc Welding (SMAW)","MIG Welding (GMAW)","TIG Welding (GTAW)","Metal Fabrication Techniques","Blueprint & Weld Symbol Reading","Structural Welding","Cutting Processes (Oxy-fuel & Plasma)","Quality Inspection & Testing","Workshop Practice & Assessment"],
      outcomes: ["Perform Arc, MIG, and TIG welding to industry standards","Read welding blueprints and weld symbols","Fabricate metal structures from technical drawings","Apply welding safety protocols and PPE requirements","Inspect welds for quality and structural integrity"],
      careers: ["Welder","Fabricator","Structural Welder","Pipeline Welder","Welding Inspector","Metal Worker"]
    },
    motor: {
      title: "Motor Vehicle Mechanics",
      tagline: "Comprehensive automotive diagnostics, repair, and maintenance for light and heavy-duty vehicles.",
      icon: "fa-car", color: "#4338CA",
      overview: "The Motor Vehicle Mechanics programme covers light and heavy-duty vehicle diagnostics, engine repair, transmission systems, brake servicing, and automotive electrical systems. Trainees develop skills in modern diagnostic tools, computerised engine management, and both petrol and diesel engine technology.",
      duration: "12 Months", intake: "January & July", certification: "BIT Automotive Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 6",
      curriculum: ["Automotive Safety & Workshop Practice","Engine Theory & Fundamentals","Petrol & Diesel Engine Repair","Transmission Systems","Brake Systems & Servicing","Automotive Electrical Systems","Vehicle Diagnostics & Fault Finding","Suspension & Steering","Air Conditioning Systems","Workshop Practice & Assessment"],
      outcomes: ["Diagnose and repair petrol and diesel engines","Service and maintain transmission and brake systems","Use modern diagnostic tools and equipment","Perform automotive electrical system repairs","Apply workshop safety and environmental standards"],
      careers: ["Motor Vehicle Mechanic","Diesel Technician","Auto Electrician","Fleet Maintenance Technician","Workshop Supervisor","Equipment Mechanic"]
    },
    carpentry: {
      title: "Carpentry & Joinery",
      tagline: "Traditional and modern woodworking skills for construction and furniture making.",
      icon: "fa-hammer", color: "#8B5A2B",
      overview: "The Carpentry & Joinery programme teaches woodworking, furniture construction, building framework, architectural joinery, and finishing techniques. Trainees learn to read construction drawings, select appropriate materials, use hand and power tools safely, and construct quality wood products for residential and commercial applications.",
      duration: "12 Months", intake: "January & July", certification: "BIT Carpentry Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 5, 6",
      curriculum: ["Workshop Safety & Tool Maintenance","Wood Science & Material Selection","Hand Tool Techniques","Power Tool Operations","Furniture Construction","Building Framework & Roofing","Architectural Joinery","Wood Finishing Techniques","Blueprint Reading","Workshop Practice & Assessment"],
      outcomes: ["Construct furniture and cabinetry to professional standards","Build structural frameworks including roofing systems","Read and interpret construction drawings and blueprints","Select appropriate wood types and materials for projects","Apply finishing techniques and quality control standards"],
      careers: ["Carpenter","Joiner","Cabinet Maker","Furniture Maker","Construction Carpenter","Building Contractor"]
    },
    masonry: {
      title: "Masonry & Construction",
      tagline: "Build the foundation — bricklaying, block work, concrete, and construction site skills.",
      icon: "fa-cubes", color: "#6B7280",
      overview: "The Masonry & Construction programme covers bricklaying, block work, concrete mixing and placement, plastering, tiling, and construction site safety. Trainees learn to read construction drawings, set out building foundations, and construct walls and structures to professional standards.",
      duration: "12 Months", intake: "January & July", certification: "BIT Masonry Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 6",
      curriculum: ["Construction Safety & Site Management","Bricklaying & Block Work","Concrete Mixing & Placement","Foundation Setting & Layout","Plastering & Rendering","Floor & Wall Tiling","Construction Mathematics","Blueprint Reading for Construction","Workshop Practice & Assessment"],
      outcomes: ["Construct walls and structures using brick and block to professional standards","Mix, place and cure concrete for various applications","Set out building foundations and layouts from drawings","Apply plastering, rendering and tiling finishes","Manage construction site safety and material handling"],
      careers: ["Mason","Bricklayer","Construction Worker","Tiler","Plastering Specialist","Building Contractor"]
    },
    it: {
      title: "Information Technology & Computer Servicing",
      tagline: "Computer hardware, networking, and digital skills for the modern technology-driven workplace.",
      icon: "fa-laptop-code", color: "#028A6D",
      overview: "The Information Technology & Computer Servicing programme provides training in computer hardware repair, networking fundamentals, operating systems, software applications, and digital literacy. Trainees develop practical skills in assembling, configuring, troubleshooting, and maintaining computer systems for personal and business use.",
      duration: "9 Months", intake: "January, May & September", certification: "BIT IT Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 6",
      curriculum: ["Computer Hardware Fundamentals","Operating Systems (Windows & Linux)","Computer Assembly & Configuration","Troubleshooting & Repair","Networking Fundamentals","Internet & Email Technologies","Office Productivity Software","Cybersecurity Basics","Workshop Practice & Assessment"],
      outcomes: ["Assemble, configure, and maintain computer systems","Install and manage Windows and Linux operating systems","Design and implement basic computer networks","Troubleshoot hardware and software problems systematically","Apply cybersecurity best practices"],
      careers: ["IT Technician","Help Desk Support","Network Technician","Computer Repair Specialist","System Administrator","IT Support Specialist"]
    },
    cosmetology: {
      title: "Cosmetology & Beauty Culture",
      tagline: "Professional beauty services — hair styling, skincare, nail artistry, and salon management.",
      icon: "fa-spa", color: "#C2185B",
      overview: "The Cosmetology & Beauty Culture programme trains students in professional hair styling, skincare treatments, nail artistry, makeup application, salon management, and hygiene standards. Graduates are prepared to work in salons, spas, and the wider beauty industry, or to start their own beauty businesses.",
      duration: "9 Months", intake: "January & July", certification: "BIT Cosmetology Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 6",
      curriculum: ["Salon Safety & Hygiene Standards","Hair Cutting & Styling Techniques","Hair Colouring & Chemical Treatments","Skincare & Facial Treatments","Nail Care & Artistry","Makeup Application","Salon Management & Customer Service","Business Skills for Beauty Professionals","Practical Assessments"],
      outcomes: ["Perform professional hair cutting, styling, and colouring","Deliver skincare treatments and facial services","Execute nail care and nail art techniques","Apply makeup for various occasions and settings","Manage salon operations and client relationships"],
      careers: ["Hairstylist","Beautician","Nail Technician","Makeup Artist","Salon Manager","Beauty Entrepreneur"]
    },
    garment: {
      title: "Garment Construction & Fashion Design",
      tagline: "Pattern making, sewing, fashion illustration, and small business skills for the garment industry.",
      icon: "fa-scissors", color: "#7B1FA2",
      overview: "The Garment Construction & Fashion Design programme covers pattern making, fabric cutting, machine and hand sewing, fashion illustration, garment finishing, and small business management. Trainees learn to create professional garments from concept to completion and develop entrepreneurial skills for the fashion industry.",
      duration: "9 Months", intake: "January & July", certification: "BIT Garment Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 6",
      curriculum: ["Garment Industry Safety & Ergonomics","Pattern Making & Drafting","Fabric Selection & Cutting","Machine Sewing Techniques","Hand Sewing & Finishing","Fashion Illustration & Design","Garment Fitting & Alterations","Business Skills & Entrepreneurship","Portfolio Development & Assessment"],
      outcomes: ["Draft patterns and construct garments from technical drawings","Operate industrial and domestic sewing machines proficiently","Select appropriate fabrics and materials for different garments","Create fashion illustrations and design concepts","Manage a small garment production business"],
      careers: ["Seamstress/Tailor","Fashion Designer","Garment Production Worker","Costume Designer","Alteration Specialist","Fashion Entrepreneur"]
    },
    culinary: {
      title: "Food Preparation & Culinary Arts",
      tagline: "Professional cooking, food safety, nutrition, and kitchen management for the hospitality industry.",
      icon: "fa-utensils", color: "#D84315",
      overview: "The Food Preparation & Culinary Arts programme provides professional training in cooking techniques, food safety and hygiene, nutrition fundamentals, kitchen management, and menu planning. Trainees develop competence in preparing diverse cuisines using modern and traditional methods, preparing them for careers in restaurants, hotels, catering, and food businesses.",
      duration: "9 Months", intake: "January & July", certification: "BIT Culinary Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 6",
      curriculum: ["Kitchen Safety & Food Hygiene","Knife Skills & Cooking Fundamentals","Soups, Stocks & Sauces","Meat, Poultry & Seafood Preparation","Baking & Pastry Arts","Caribbean & International Cuisine","Menu Planning & Nutrition","Kitchen Management & Cost Control","Practical Assessments"],
      outcomes: ["Prepare a wide range of dishes using professional techniques","Apply food safety and hygiene standards in kitchen operations","Plan nutritionally balanced menus for various settings","Manage kitchen operations including inventory and cost control","Demonstrate proficiency in Caribbean and international cuisines"],
      careers: ["Chef","Cook","Pastry Chef","Catering Manager","Food Production Worker","Restaurant Entrepreneur"]
    },
    ac: {
      title: "Air Conditioning & Refrigeration",
      tagline: "HVAC installation, refrigeration mechanics, and environmental compliance for climate control systems.",
      icon: "fa-snowflake", color: "#1565C0",
      overview: "The Air Conditioning & Refrigeration programme covers HVAC systems installation, refrigeration mechanics, troubleshooting, preventive maintenance, and environmental compliance. With Guyana's tropical climate, demand for qualified AC and refrigeration technicians remains consistently high across residential, commercial, and industrial sectors.",
      duration: "12 Months", intake: "January & July", certification: "BIT HVAC Certificate", eligibility: "16+ years, Basic literacy & numeracy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 6",
      curriculum: ["HVAC Safety & Environmental Regulations","Refrigeration Cycle Theory","Air Conditioning Systems","Refrigeration Systems","Electrical Controls for HVAC","Troubleshooting & Diagnostics","Preventive Maintenance","Refrigerant Handling & Recovery","Workshop Practice & Assessment"],
      outcomes: ["Install and commission air conditioning and refrigeration systems","Diagnose and repair faults in HVAC equipment","Perform scheduled preventive maintenance on climate systems","Handle refrigerants safely in compliance with environmental regulations","Read and interpret HVAC technical drawings and specifications"],
      careers: ["HVAC Technician","Refrigeration Mechanic","AC Installer","Maintenance Technician","Building Services Technician","HVAC Contractor"]
    },
    agriculture: {
      title: "Agriculture & Agro-Processing",
      tagline: "Modern farming techniques, livestock management, and value-added food processing.",
      icon: "fa-seedling", color: "#2E7D32",
      overview: "The Agriculture & Agro-Processing programme provides training in crop cultivation, livestock management, food processing techniques, value-added production, and sustainable farming practices. Trainees learn modern agricultural methods alongside traditional knowledge, preparing them for careers in Guyana's vital agricultural sector.",
      duration: "4 to 6 Months", intake: "January & July", certification: "BIT Agriculture Certificate", eligibility: "16+ years, Basic literacy", mode: "Full-Time, In-Person", location: "Regional Centres (Regions 2, 3, 5, 6, 9, 10)",
      curriculum: ["Agricultural Safety & Land Management","Crop Production & Horticulture","Livestock Management & Animal Husbandry","Soil Science & Irrigation","Pest & Disease Management","Post-Harvest Handling & Storage","Agro-Processing Techniques","Farm Business Management","Field Practice & Assessment"],
      outcomes: ["Cultivate crops using modern and sustainable farming techniques","Manage livestock health, nutrition, and breeding programmes","Apply agro-processing methods for value-added production","Implement pest management and soil conservation practices","Develop and manage a small agricultural business"],
      careers: ["Farmer","Agricultural Technician","Agro-Processor","Farm Manager","Extension Worker","Agricultural Entrepreneur"]
    },
    photovoltaic: {
      title: "Photovoltaic Installation",
      tagline: "Solar PV system design, installation, and maintenance for Guyana's energy transition.",
      icon: "fa-solar-panel", color: "#F2A522",
      overview: "The Photovoltaic Installation programme trains technicians to design, install, commission and maintain residential and commercial solar PV systems — from module selection to inverter wiring to grid-tie. Aligned with Guyana's renewable energy push, graduates are positioned for the rapidly-growing solar workforce.",
      duration: "4 Months", intake: "January & July", certification: "BIT Photovoltaic Installer Certificate", eligibility: "16+ years, Basic numeracy", mode: "Full-Time, In-Person", location: "Georgetown, Regions 3, 4, 6",
      curriculum: ["Solar PV Theory & Site Assessment","Module Selection & Mounting Systems","DC & AC Wiring for PV","Inverter Configuration","Battery Storage Integration","Grid-Tie & Net Metering","System Commissioning & Testing","Preventive Maintenance & Troubleshooting","Workshop Practice & Assessment"],
      outcomes: ["Design and size residential / commercial PV arrays","Install modules, racking and balance-of-system components safely","Configure inverters and battery storage to specification","Commission systems and verify performance","Diagnose and repair faults across the PV value chain"],
      careers: ["Solar PV Installer","Renewable Energy Technician","Electrical Apprentice (PV)","Solar Sales Specialist","Off-grid Systems Designer"]
    },
    "heavy-duty": {
      title: "Heavy-Duty Equipment Operation",
      tagline: "Excavators, bulldozers, loaders — operating and maintaining the machines that build Guyana.",
      icon: "fa-truck-monster", color: "#2B9DB0",
      overview: "The Heavy-Duty Equipment Operation programme trains operators in the safe, productive use of excavators, bulldozers, loaders, motor graders and articulated dump trucks. Trainees develop pre-operational inspection skills, machine control, ground-engagement techniques, and basic field maintenance — readying them for the construction, mining, and infrastructure sectors.",
      duration: "4 to 6 Months", intake: "January & July", certification: "BIT Heavy-Duty Equipment Operator Certificate", eligibility: "18+ years, Driver's licence preferred, Basic literacy", mode: "Full-Time, In-Person", location: "Georgetown, Region 6 Berbice (Corriverton centre)",
      curriculum: ["Site Safety & Hazard Awareness","Pre-Operational Inspection & Daily Maintenance","Excavator Controls & Earthworks","Bulldozer & Track Loader Operation","Wheel Loader & Motor Grader","Articulated Dump Truck Handling","Ground-Engagement Techniques","Fuel, Hydraulic & Lubrication Systems","Field Practice & Assessment"],
      outcomes: ["Safely operate multiple classes of heavy earthmoving equipment","Perform pre-operational inspections and routine field maintenance","Read site plans and execute earthworks to specification","Apply OSHA-aligned safety practices on active worksites","Diagnose common machine faults in the field"],
      careers: ["Heavy Equipment Operator","Construction Plant Operator","Mining Machinery Operator","Site Supervisor (Earthworks)","Equipment Yard Foreman"]
    },
    /* "oil-gas" programme removed per review-1 feedback (BIT does not offer this). */
    "web-dev": {
      title: "Website Development & Digital Marketing",
      tagline: "Frontend web development, digital marketing fundamentals, and freelance career skills for the digital economy.",
      icon: "fa-code", color: "#9DC9FF",
      overview: "The Website Development programme equips trainees with HTML, CSS, JavaScript, responsive design, content management systems, and digital marketing fundamentals — preparing them to build and maintain websites for clients, run e-commerce stores, or work as digital freelancers. Includes practical training in WordPress, basic SEO, and social media marketing.",
      duration: "4 Months", intake: "January, May & September", certification: "BIT Website Development Certificate", eligibility: "16+ years, Basic computer literacy", mode: "Full-Time, In-Person", location: "Georgetown HQ",
      curriculum: ["HTML5 & Semantic Markup","CSS3, Flexbox & Grid","JavaScript Fundamentals","Responsive & Mobile-First Design","WordPress Site Building","Search Engine Optimisation Basics","Social Media & Content Marketing","Freelance Business Skills","Portfolio Project & Assessment"],
      outcomes: ["Build responsive multi-page websites from scratch","Customise WordPress themes and plugins for clients","Apply on-page SEO and basic analytics tracking","Plan and execute social-media marketing campaigns","Operate as a digital freelancer or in-house web specialist"],
      careers: ["Web Developer (Junior)","WordPress Specialist","Digital Marketing Assistant","Freelance Web Designer","Content & Social Media Manager"]
    }
  };

  // Populate page from URL param — DOM API only, no innerHTML with dynamic data
  document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    // Sanitize: allow only alphanumeric keys and hyphens; must match a known key
    const rawPid = params.get('p') || 'electrical';
    const pid = String(rawPid).replace(/[^a-zA-Z0-9-]/g, '').slice(0, 30);
    const prog = Object.prototype.hasOwnProperty.call(programmes, pid) ? programmes[pid] : null;

    if (!prog) { window.location = 'programmes.html'; return; }

    // Safe DOM helpers
    const el = (tag, cls, text) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    };
    const clear = (id) => { const n = document.getElementById(id); if (n) n.textContent = ''; return n; };

    // Meta (textContent is safe)
    document.title = prog.title + ' — BIT Guyana';
    document.getElementById('programmeTitle').textContent = prog.title;
    document.getElementById('programmeTagline').textContent = prog.tagline;
    document.getElementById('breadcrumbName').textContent = prog.title;
    document.getElementById('programmeOverview').textContent = prog.overview;

    // Info sidebar
    const infoRows = clear('infoRows');
    [['Duration', prog.duration], ['Intake Periods', prog.intake], ['Certification', prog.certification],
     ['Eligibility', prog.eligibility], ['Study Mode', prog.mode], ['Location', prog.location]
    ].forEach(([l, v]) => {
      const row = el('div', 'info-row');
      row.appendChild(el('span', 'label', l));
      row.appendChild(el('span', 'value', v));
      infoRows.appendChild(row);
    });

    // Curriculum
    const curriculumList = clear('curriculumList');
    prog.curriculum.forEach((item, i) => {
      const wrap = el('div', 'curriculum-item');
      wrap.appendChild(el('div', 'curriculum-num', String(i + 1)));
      const inner = el('div');
      inner.appendChild(el('strong', null, item));
      wrap.appendChild(inner);
      curriculumList.appendChild(wrap);
    });

    // Outcomes
    const outcomesList = clear('outcomesList');
    prog.outcomes.forEach(item => {
      const wrap = el('div', 'outcome-item');
      const icon = document.createElement('i');
      icon.className = 'fas fa-check-circle';
      wrap.appendChild(icon);
      wrap.appendChild(el('span', null, item));
      outcomesList.appendChild(wrap);
    });

    // Careers
    const careersList = clear('careersList');
    prog.careers.forEach(item => {
      const wrap = el('div');
      wrap.style.cssText = 'background:var(--gray-100);padding:var(--space-md) var(--space-lg);border-radius:var(--radius-md);text-align:center;font-weight:500;font-size:0.92rem';
      const icon = document.createElement('i');
      icon.className = 'fas fa-briefcase';
      icon.style.cssText = 'color:var(--primary);margin-right:6px';
      wrap.appendChild(icon);
      wrap.appendChild(document.createTextNode(item));
      careersList.appendChild(wrap);
    });

    // Related programmes (3 random excluding current)
    const relatedList = clear('relatedProgrammes');
    const keys = Object.keys(programmes).filter(k => k !== pid);
    // Fisher-Yates shuffle
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    keys.slice(0, 3).forEach(k => {
      const p = programmes[k];
      const card = el('div', 'programme-card');
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => { window.location = 'programme-detail.html?p=' + encodeURIComponent(k); });
      const iconWrap = el('div', 'icon');
      const icon = document.createElement('i');
      icon.className = 'fas ' + p.icon;
      icon.style.cssText = 'color:' + p.color + ';font-size:1.5rem';
      iconWrap.appendChild(icon);
      card.appendChild(iconWrap);
      card.appendChild(el('h3', null, p.title));
      const tag = el('p', null, p.tagline);
      tag.style.cssText = 'font-size:0.9rem;color:var(--gray-600)';
      card.appendChild(tag);
      const link = document.createElement('a');
      link.href = 'programme-detail.html?p=' + encodeURIComponent(k);
      link.className = 'card-link';
      link.appendChild(document.createTextNode('View Details '));
      const arrow = document.createElement('i');
      arrow.className = 'fas fa-arrow-right';
      link.appendChild(arrow);
      card.appendChild(link);
      relatedList.appendChild(card);
    });
  });
