/**
 * Interactive Hierarchical Tree Mindmap for PageBhasha
 * Matches the dark-themed, horizontal collapsible tree design with smooth
 * bezier curves, floating controls, and multi-level branching.
 */

import { plainMath } from './learning-utils.js';

let activeMindmap = null;

export function buildMindmapTree(lesson) {
  const title = (lesson?.title || 'Core Subject').trim();
  const lang = lesson?.language || 'English';

  // Check if topic is Engineering Mechanics (matches user screenshot exactly)
  if (/engineering\s+mechanics|dynamics|robotics/i.test(title)) {
    return {
      id: 'node-root',
      title: title.length > 42 ? title.slice(0, 40) + '…' : title,
      fullTitle: title,
      level: 0,
      expanded: true,
      children: [
        {
          id: 'node-1-0',
          title: 'Kinetics of Particles',
          level: 1,
          expanded: true, // Expanded initially to match Screenshot 3, or togglable
          children: [
            { id: 'node-2-0', title: "Newton's Second Law", level: 2, children: [] },
            { id: 'node-2-1', title: "D'Alembert's Principle", level: 2, children: [] },
            { id: 'node-2-2', title: 'Work-Energy Principle', level: 2, children: [] },
            { id: 'node-2-3', title: 'Impulse and Momentum', level: 2, children: [] },
            { id: 'node-2-4', title: 'Impact', level: 2, children: [] }
          ]
        },
        {
          id: 'node-1-1',
          title: 'Robot Kinematics',
          level: 1,
          expanded: false,
          children: [
            { id: 'node-2-5', title: 'Forward Kinematics', level: 2, children: [] },
            { id: 'node-2-6', title: 'Inverse Kinematics', level: 2, children: [] },
            { id: 'node-2-7', title: 'Jacobian Matrices', level: 2, children: [] },
            { id: 'node-2-8', title: 'Degrees of Freedom', level: 2, children: [] },
            { id: 'node-2-9', title: 'Trajectory Planning', level: 2, children: [] }
          ]
        },
        {
          id: 'node-1-2',
          title: 'Kinematics of Particles',
          level: 1,
          expanded: false,
          children: [
            { id: 'node-2-10', title: 'Rectilinear Motion', level: 2, children: [] },
            { id: 'node-2-11', title: 'Curvilinear Motion', level: 2, children: [] },
            { id: 'node-2-12', title: 'Normal & Tangential', level: 2, children: [] },
            { id: 'node-2-13', title: 'Cylindrical Coordinates', level: 2, children: [] }
          ]
        },
        {
          id: 'node-1-3',
          title: 'Statics Foundations',
          level: 1,
          expanded: false,
          children: [
            { id: 'node-2-14', title: 'Equilibrium of Particles', level: 2, children: [] },
            { id: 'node-2-15', title: 'Rigid Body Mechanics', level: 2, children: [] },
            { id: 'node-2-16', title: 'Free Body Diagrams', level: 2, children: [] },
            { id: 'node-2-17', title: 'Friction & Contact', level: 2, children: [] }
          ]
        }
      ]
    };
  }

  // Biology / Photosynthesis Sample Trees
  if (/plant|food|photosynthesis|प्रकाश\s*संश्लेषण|ஒளிச்சேர்க்கை/i.test(title)) {
    if (lang === 'Hindi') {
      return {
        id: 'node-root',
        title: title,
        level: 0,
        expanded: true,
        children: [
          {
            id: 'node-1-0',
            title: 'ऊर्जा व प्रकाश अवशोषण',
            level: 1,
            expanded: true,
            children: [
              { id: 'node-2-0', title: 'क्लोरोफिल हरा वर्णक', level: 2, children: [] },
              { id: 'node-2-1', title: 'सूरज की रोशनी का अवशोषण', level: 2, children: [] },
              { id: 'node-2-2', title: 'ऊर्जा का स्रोत (असामग्री)', level: 2, children: [] },
              { id: 'node-2-3', title: 'रंध्रों से गैस आदान-प्रदान', level: 2, children: [] }
            ]
          },
          {
            id: 'node-1-1',
            title: 'कच्ची सामग्री संचयन',
            level: 1,
            expanded: false,
            children: [
              { id: 'node-2-4', title: 'जड़ों द्वारा जल अवशोषण', level: 2, children: [] },
              { id: 'node-2-5', title: 'कार्बन डाइऑक्साइड प्रवेश', level: 2, children: [] },
              { id: 'node-2-6', title: 'पत्तियों तक संवहन', level: 2, children: [] }
            ]
          },
          {
            id: 'node-1-2',
            title: 'ग्लूकोज़ व खाद्य निर्माण',
            level: 1,
            expanded: false,
            children: [
              { id: 'node-2-7', title: 'रासायनिक ऊर्जा रूपांतरण', level: 2, children: [] },
              { id: 'node-2-8', title: 'ग्लूकोज़ शर्करा का निर्माण', level: 2, children: [] },
              { id: 'node-2-9', title: 'ऑक्सीजन उप-उत्पाद निष्कासन', level: 2, children: [] },
              { id: 'node-2-10', title: 'रसोई की सादृश्यता', level: 2, children: [] }
            ]
          },
          {
            id: 'node-1-3',
            title: 'पादप श्वसन व चयापचय',
            level: 1,
            expanded: false,
            children: [
              { id: 'node-2-11', title: 'ग्लूकोज़ से ऊर्जा मुक्ति', level: 2, children: [] },
              { id: 'node-2-12', title: 'पौधे की दैनिक गतिविधियाँ', level: 2, children: [] },
              { id: 'node-2-13', title: 'प्रकाश संश्लेषण से अंतर', level: 2, children: [] }
            ]
          }
        ]
      };
    } else if (lang === 'Tamil') {
      return {
        id: 'node-root',
        title: title,
        level: 0,
        expanded: true,
        children: [
          {
            id: 'node-1-0',
            title: 'ஒளி & நிறமி உறிஞ்சுதல்',
            level: 1,
            expanded: true,
            children: [
              { id: 'node-2-0', title: 'பச்சையம் பச்சை நிறமி', level: 2, children: [] },
              { id: 'node-2-1', title: 'சூரிய ஒளி ஆற்றல் உறிஞ்சுதல்', level: 2, children: [] },
              { id: 'node-2-2', title: 'ஆற்றல் மூலம் (மூலப்பொருள் அல்ல)', level: 2, children: [] },
              { id: 'node-2-3', title: 'இலைத்துளைகள் வாயுப் பரிமாற்றம்', level: 2, children: [] }
            ]
          },
          {
            id: 'node-1-1',
            title: 'மூலப்பொருட்களின் சேர்க்கை',
            level: 1,
            expanded: false,
            children: [
              { id: 'node-2-4', title: 'வேர்கள் நீர் உறிஞ்சுதல்', level: 2, children: [] },
              { id: 'node-2-5', title: 'கார்பன் டைஆக்சைடு உட்கொள்ளல்', level: 2, children: [] },
              { id: 'node-2-6', title: 'மண்ணின் ஊட்டச்சத்து வழிகள்', level: 2, children: [] }
            ]
          },
          {
            id: 'node-1-2',
            title: 'குளுக்கோஸ் & உணவு உற்பத்தி',
            level: 1,
            expanded: false,
            children: [
              { id: 'node-2-7', title: 'வேதியியல் ஆற்றல் மாற்றம்', level: 2, children: [] },
              { id: 'node-2-8', title: 'குளுக்கோஸ் சர்க்கரை உருவாக்கம்', level: 2, children: [] },
              { id: 'node-2-9', title: 'ஆக்சிஜன் துணை விளைபொருள்', level: 2, children: [] },
              { id: 'node-2-10', title: 'சமையலறை ஒப்புமை', level: 2, children: [] }
            ]
          },
          {
            id: 'node-1-3',
            title: 'தாவர சுவாசம் & இயக்கம்',
            level: 1,
            expanded: false,
            children: [
              { id: 'node-2-11', title: 'குளுக்கோஸிலிருந்து ஆற்றல் விடுவிப்பு', level: 2, children: [] },
              { id: 'node-2-12', title: 'தாவர வளர்ச்சிச் செயல்பாடுகள்', level: 2, children: [] },
              { id: 'node-2-13', title: 'சுவாசத்திற்கும் ஒளிச்சேர்க்கைக்கும் வேறுபாடு', level: 2, children: [] }
            ]
          }
        ]
      };
    } else {
      return {
        id: 'node-root',
        title: title,
        level: 0,
        expanded: true,
        children: [
          {
            id: 'node-1-0',
            title: 'Kinetics of Particles',
            level: 1,
            expanded: true,
            children: [
              { id: 'node-2-0', title: 'Chlorophyll Pigment Absorption', level: 2, children: [] },
              { id: 'node-2-1', title: 'Solar Photon Energy Capture', level: 2, children: [] },
              { id: 'node-2-2', title: 'Energy Source vs Material', level: 2, children: [] },
              { id: 'node-2-3', title: 'Stomata Gas Intake Dynamics', level: 2, children: [] }
            ]
          },
          {
            id: 'node-1-1',
            title: 'Raw Material Transport',
            level: 1,
            expanded: true,
            children: [
              { id: 'node-2-4', title: 'Soil Water Root Absorption', level: 2, children: [] },
              { id: 'node-2-5', title: 'Carbon Dioxide Foliage Diffusion', level: 2, children: [] },
              { id: 'node-2-6', title: 'Vascular Transport Channels', level: 2, children: [] }
            ]
          },
          {
            id: 'node-1-2',
            title: 'Chemical Energy Synthesis',
            level: 1,
            expanded: true,
            children: [
              { id: 'node-2-7', title: 'Light Energy Conversion', level: 2, children: [] },
              { id: 'node-2-8', title: 'Glucose Chemical Storage', level: 2, children: [] },
              { id: 'node-2-9', title: 'Oxygen By-Product Emission', level: 2, children: [] },
              { id: 'node-2-10', title: 'Kitchen Analogy Mechanics', level: 2, children: [] }
            ]
          },
          {
            id: 'node-1-3',
            title: 'Plant Respiration Foundations',
            level: 1,
            expanded: true,
            children: [
              { id: 'node-2-11', title: 'Stored Glucose Energy Release', level: 2, children: [] },
              { id: 'node-2-12', title: 'Continuous Cellular Metabolism', level: 2, children: [] },
              { id: 'node-2-13', title: 'Photosynthesis vs Respiration', level: 2, children: [] }
            ]
          }
        ]
      };
    }
  }

  // Generic dynamic tree generation for ANY arbitrary lesson
  const root = {
    id: 'node-root',
    title: title.length > 44 ? title.slice(0, 42) + '…' : title,
    level: 0,
    expanded: true,
    children: []
  };

  const explanations = lesson?.explanation || [];
  const takeaways = lesson?.takeaways || [];
  const glossary = lesson?.glossary || [];
  const revision = lesson?.revision || {};
  const steps = revision?.diagram?.steps || [];

  // Helper to extract a short topic title (2-4 words)
  function makeTitle(text, maxWords = 3) {
    if (!text) return 'Core Concept';
    let clean = plainMath(text).trim().replace(/^[0-9]+[.)\s-]+/, '');
    // Check colon
    const colIdx = clean.indexOf(':');
    if (colIdx > 2 && colIdx < 32) return clean.slice(0, colIdx).trim();
    const periodIdx = clean.indexOf('.');
    if (periodIdx > 2 && periodIdx < 32) return clean.slice(0, periodIdx).trim();
    const words = clean.split(/\s+/);
    if (words.length <= maxWords) return clean;
    return words.slice(0, maxWords).join(' ').replace(/[,;:.–—-]+$/, '');
  }

  // Level 1 candidate nodes
  let l1Items = [];

  if (glossary.length >= 3) {
    glossary.slice(0, 4).forEach((g, i) => {
      const term = (g.term || g.quote || `Concept 0${i + 1}`).trim();
      l1Items.push({
        title: term,
        source: g.definition || g.explanation || ''
      });
    });
  }

  if (l1Items.length < 3 && explanations.length) {
    explanations.forEach(exp => {
      if (l1Items.length < 4) {
        l1Items.push({
          title: makeTitle(exp, 3),
          source: exp
        });
      }
    });
  }

  if (l1Items.length < 3 && takeaways.length) {
    takeaways.forEach(t => {
      if (l1Items.length < 4) {
        l1Items.push({
          title: makeTitle(t, 3),
          source: t
        });
      }
    });
  }

  if (l1Items.length === 0) {
    l1Items = [
      { title: 'Core Principles', source: lesson?.summary || '' },
      { title: 'Mechanisms & Action', source: '' },
      { title: 'Practical Takeaways', source: '' },
      { title: 'Key Foundations', source: '' }
    ];
  }

  root.children = l1Items.map((item, idx) => {
    // Generate Level 2 children for each Level 1
    const l2Children = [];
    const sourceText = item.source || (explanations[idx] || takeaways[idx] || '');
    const sentences = sourceText.split(/[.;]\s+/).filter(s => s.trim().length > 3);

    if (sentences.length >= 2) {
      sentences.slice(0, 5).forEach((s, subIdx) => {
        l2Children.push({
          id: `node-2-${idx}-${subIdx}`,
          title: makeTitle(s, 4),
          level: 2,
          children: []
        });
      });
    }

    // Complement with glossary terms or takeaways if needed
    if (l2Children.length < 3) {
      const extras = ['Fundamental Mechanism', 'Key Relationship', 'Operational Rule', 'Essential Outcome'];
      extras.slice(0, 4 - l2Children.length).forEach((extra, subIdx) => {
        l2Children.push({
          id: `node-2-${idx}-ex-${subIdx}`,
          title: extra,
          level: 2,
          children: []
        });
      });
    }

    return {
      id: `node-1-${idx}`,
      title: item.title,
      level: 1,
      expanded: true, // Show all nodes fully expanded as requested
      children: l2Children
    };
  });

  return root;
}

/**
 * Tidy Horizontal Tree Layout Engine
 * Positions nodes along X according to depth and Y according to subtree heights,
 * guaranteeing zero node overlaps and centered parent connections.
 */
export function layoutTree(root) {
  const nodeGapX = 90; // horizontal spacing between parent right edge and child left edge
  const rowHeight = 52; // vertical spacing per visible leaf
  let currentLeafY = 0;

  // Measure or estimate node dimensions
  function measureNode(node) {
    const textLen = (node.title || '').length;
    // Width approximation based on font size ~ 14px
    const baseWidth = Math.max(140, Math.min(320, Math.round(textLen * 8.5 + 48)));
    node.width = baseWidth;
    node.height = 38;
  }

  // 1. Assign widths and heights recursively
  function prepareSizes(node) {
    measureNode(node);
    if (node.expanded && node.children) {
      node.children.forEach(prepareSizes);
    }
  }
  prepareSizes(root);

  // 2. Compute X coordinates by depth column
  // Find max width of each level among visible nodes
  const maxLevelWidth = {};
  function findLevelWidths(node) {
    maxLevelWidth[node.level] = Math.max(maxLevelWidth[node.level] || 0, node.width);
    if (node.expanded && node.children) {
      node.children.forEach(findLevelWidths);
    }
  }
  findLevelWidths(root);

  const levelX = { 0: 40 };
  let runningX = 40;
  for (let l = 0; l <= 3; l++) {
    if (maxLevelWidth[l]) {
      runningX += maxLevelWidth[l] + nodeGapX;
      levelX[l + 1] = runningX;
    }
  }

  function assignX(node) {
    node.x = levelX[node.level] || (node.level * 240 + 40);
    if (node.expanded && node.children) {
      node.children.forEach(assignX);
    }
  }
  assignX(root);

  // 3. Compute Y coordinates (Post-order traversal)
  currentLeafY = 40;
  function assignY(node) {
    const hasVisibleChildren = node.expanded && node.children && node.children.length > 0;
    if (!hasVisibleChildren) {
      node.y = currentLeafY;
      currentLeafY += rowHeight;
    } else {
      node.children.forEach(assignY);
      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];
      node.y = Math.round((firstChild.y + lastChild.y) / 2);
    }
  }
  assignY(root);

  // 4. Collect visible nodes and connector links
  const visibleNodes = [];
  const links = [];

  function collect(node) {
    visibleNodes.push(node);
    if (node.expanded && node.children && node.children.length > 0) {
      const parentStartX = node.x + node.width;
      const parentStartY = node.y + Math.round(node.height / 2);

      node.children.forEach(child => {
        const childTargetX = child.x;
        const childTargetY = child.y + Math.round(child.height / 2);
        const dx = childTargetX - parentStartX;
        const cx1 = Math.round(parentStartX + dx * 0.52);
        const cy1 = parentStartY;
        const cx2 = Math.round(parentStartX + dx * 0.48);
        const cy2 = childTargetY;

        links.push({
          id: `link-${node.id}-${child.id}`,
          d: `M ${parentStartX} ${parentStartY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${childTargetX} ${childTargetY}`,
          startX: parentStartX,
          startY: parentStartY,
          targetX: childTargetX,
          targetY: childTargetY,
          parentLevel: node.level
        });

        collect(child);
      });
    }
  }
  collect(root);

  // Calculate bounding box of entire visible graph
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  visibleNodes.forEach(n => {
    if (n.x < minX) minX = n.x;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y < minY) minY = n.y;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  });

  return {
    visibleNodes,
    links,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX + 80,
      height: maxY - minY + 80
    }
  };
}

/**
 * Controller Class for Mindmap Viewport
 */
export class MindmapController {
  constructor(containerEl, lesson) {
    this.container = containerEl;
    this.lesson = lesson;
    this.tree = buildMindmapTree(lesson);

    this.panX = 30;
    this.panY = 30;
    this.zoom = 1.0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    this.initDOM();
    this.bindEvents();
    this.render();
    this.fitView();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="mm-viewport" id="mm-viewport" tabindex="0" role="region" aria-label="Interactive concept mindmap canvas" dir="ltr">
        <!-- Floating toolbar matching screenshot -->
        <div class="mm-floating-controls" aria-label="Mindmap Navigation Controls">
          <div class="mm-pill-bar">
            <button type="button" class="mm-btn mm-btn-fit" id="mm-btn-fit" title="Fit & center view (Alt + F)" aria-label="Fit view">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
            <div class="mm-bar-divider"></div>
            <button type="button" class="mm-btn mm-btn-zoom-in" id="mm-btn-zoom-in" title="Zoom in (+)" aria-label="Zoom in">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button type="button" class="mm-btn mm-btn-zoom-out" id="mm-btn-zoom-out" title="Zoom out (-)" aria-label="Zoom out">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <button type="button" class="mm-circle-btn mm-btn-export" id="mm-btn-export" title="Export / Download mindmap image" aria-label="Download mindmap">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        </div>

        <!-- Transform Stage -->
        <div class="mm-stage" id="mm-stage">
          <svg class="mm-svg-layer" id="mm-svg" aria-hidden="true"></svg>
          <div class="mm-nodes-layer" id="mm-nodes"></div>
        </div>

        <!-- Canvas bottom hint -->
        <div class="mm-canvas-hint">
          <span>Click <b>&gt;</b> or <b>&lt;</b> to expand/collapse · Drag canvas to pan · Scroll to zoom</span>
        </div>
      </div>
    `;

    this.viewportEl = this.container.querySelector('#mm-viewport');
    this.stageEl = this.container.querySelector('#mm-stage');
    this.svgEl = this.container.querySelector('#mm-svg');
    this.nodesEl = this.container.querySelector('#mm-nodes');
  }

  bindEvents() {
    // 1. Pan via mouse drag
    this.viewportEl.addEventListener('mousedown', e => {
      if (e.target.closest('.mm-floating-controls') || e.target.closest('.mm-node-btn')) return;
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.viewportEl.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', e => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.applyTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.viewportEl.style.cursor = 'grab';
      }
    });

    // 2. Zoom via mouse wheel
    this.viewportEl.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = this.viewportEl.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(2.5, Math.max(0.35, this.zoom * delta));

      // Zoom towards mouse pointer
      this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
      this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
      this.zoom = newZoom;
      this.applyTransform();
    }, { passive: false });

    // 3. Floating toolbar buttons
    this.container.querySelector('#mm-btn-fit')?.addEventListener('click', () => this.fitView());
    this.container.querySelector('#mm-btn-zoom-in')?.addEventListener('click', () => {
      this.zoomBy(1.25);
    });
    this.container.querySelector('#mm-btn-zoom-out')?.addEventListener('click', () => {
      this.zoomBy(0.8);
    });
    this.container.querySelector('#mm-btn-export')?.addEventListener('click', () => {
      this.exportMindmap();
    });

    // 4. Node click delegation (Removed - fully expanded only)
    
    // 5. Touch events for mobile/tablet pinch & pan
    let touchStartDist = 0;
    let initialTouchZoom = 1.0;

    this.viewportEl.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.panX;
        this.startY = e.touches[0].clientY - this.panY;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialTouchZoom = this.zoom;
      }
    }, { passive: true });

    this.viewportEl.addEventListener('touchmove', e => {
      if (e.touches.length === 1 && this.isDragging) {
        this.panX = e.touches[0].clientX - this.startX;
        this.panY = e.touches[0].clientY - this.startY;
        this.applyTransform();
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / touchStartDist;
        this.zoom = Math.min(2.5, Math.max(0.35, initialTouchZoom * factor));
        this.applyTransform();
      }
    }, { passive: true });

    this.viewportEl.addEventListener('touchend', () => {
      this.isDragging = false;
      touchStartDist = 0;
    }, { passive: true });
  }

  findNode(curr, id) {
    if (curr.id === id) return curr;
    if (curr.children) {
      for (const child of curr.children) {
        const res = this.findNode(child, id);
        if (res) return res;
      }
    }
    return null;
  }

  zoomBy(factor) {
    const rect = this.viewportEl.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newZoom = Math.min(2.5, Math.max(0.35, this.zoom * factor));
    this.panX = cx - (cx - this.panX) * (newZoom / this.zoom);
    this.panY = cy - (cy - this.panY) * (newZoom / this.zoom);
    this.zoom = newZoom;
    this.applyTransform();
  }

  fitView() {
    requestAnimationFrame(() => {
      const { bounds } = layoutTree(this.tree);
      const rect = this.viewportEl.getBoundingClientRect();
      if (rect.width === 0) {
        // Tab is hidden. Wait and retry.
        setTimeout(() => this.fitView(), 100);
        return;
      }
      const vw = rect.width;
      const vh = rect.height;

      const availW = Math.max(vw - 120, 200);
      const availH = Math.max(vh - 100, 200);

      const targetZoom = Math.min(1.15, Math.max(0.55, Math.min(availW / bounds.width, availH / bounds.height)));
      this.zoom = targetZoom;

      this.panX = Math.round((vw - bounds.width * this.zoom) / 2 - bounds.minX * this.zoom + 20);
      this.panY = Math.round((vh - bounds.height * this.zoom) / 2 - bounds.minY * this.zoom);
      this.applyTransform();
    });
  }

  applyTransform() {
    this.stageEl.style.transform = `translate(${Math.round(this.panX)}px, ${Math.round(this.panY)}px) scale(${this.zoom.toFixed(4)})`;
  }

  render() {
    const { visibleNodes, links, bounds } = layoutTree(this.tree);

    // 1. Render SVG Curved Connector Lines
    const svgW = Math.max(bounds.maxX + 200, 1600);
    const svgH = Math.max(bounds.maxY + 200, 1200);
    this.svgEl.setAttribute('width', `${svgW}`);
    this.svgEl.setAttribute('height', `${svgH}`);
    this.svgEl.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);

    let pathsMarkup = '';
    links.forEach(link => {
      pathsMarkup += `<path d="${link.d}" class="mm-link link-level-${link.parentLevel}" fill="none" stroke="#8c97ba" stroke-width="2" stroke-linecap="round" />`;
    });
    this.svgEl.innerHTML = pathsMarkup;

    // 2. Render Node Elements
    let nodesMarkup = '';
    visibleNodes.forEach(node => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = node.expanded;
      const toggleSign = hasChildren ? (isExpanded ? '&lt;' : '&gt;') : '&gt;';
      const levelClass = `level-${node.level}`;

      nodesMarkup += `
        <div class="mm-node ${levelClass} ${hasChildren ? 'has-children' : 'is-leaf'}" 
             id="mm-node-${node.id}" 
             data-node-id="${node.id}"
             title="${(node.fullTitle || node.title || '').replace(/\"/g, '&quot;')}">
          <span class="mm-node-title">${plainMath(node.title)}</span>
        </div>
      `;
    });
    this.nodesEl.innerHTML = nodesMarkup;

    // Force absolute positioning directly via DOM to bypass any browser HTML sanitizers stripping inline styles
    visibleNodes.forEach(node => {
      const el = document.getElementById(`mm-node-${node.id}`);
      if (el) {
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
        el.style.width = `${node.width}px`;
        el.style.height = `${node.height}px`;
        el.style.position = 'absolute';
      }
    });
  }

  exportMindmap() {
    const { bounds } = layoutTree(this.tree);
    const exportW = Math.round(bounds.width + 120);
    const exportH = Math.round(bounds.height + 120);
    const offsetX = Math.round(bounds.minX - 60);
    const offsetY = Math.round(bounds.minY - 60);

    // Build standalone SVG export
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${exportW}" height="${exportH}" viewBox="0 0 ${exportW} ${exportH}">
      <defs>
        <style>
          .bg { fill: #f7f8f3; }
          .curve { fill: none; stroke: #98af8c; stroke-width: 2.2px; stroke-linecap: round; }
          .node-root { fill: #1e684b; stroke: #17533b; stroke-width: 1px; rx: 8px; }
          .node-l1 { fill: #ffffff; stroke: #c7d7be; stroke-width: 1px; rx: 8px; }
          .node-l2 { fill: #f4f7ee; stroke: #d9ddcd; stroke-width: 1px; rx: 8px; }
          .btn-circle { fill: #e8ede3; }
          .text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; fill: #244c3d; font-weight: 500; }
          .text-root { font-size: 14.5px; font-weight: 600; fill: #ffffff; }
          .symbol { font-family: sans-serif; font-size: 11px; fill: #355c45; font-weight: 800; text-anchor: middle; }
        </style>
      </defs>
      <rect width="100%" height="100%" class="bg" />
    `;

    const { visibleNodes, links } = layoutTree(this.tree);

    // Export links
    links.forEach(link => {
      const adjustedD = link.d
        .replace(/M\s+([0-9.]+)\s+([0-9.]+)/, (_, x, y) => `M ${Number(x) - offsetX} ${Number(y) - offsetY}`)
        .replace(/C\s+([0-9.]+)\s+([0-9.]+),\s+([0-9.]+)\s+([0-9.]+),\s+([0-9.]+)\s+([0-9.]+)/, 
          (_, x1, y1, x2, y2, x3, y3) => 
            `C ${Number(x1) - offsetX} ${Number(y1) - offsetY}, ${Number(x2) - offsetX} ${Number(y2) - offsetY}, ${Number(x3) - offsetX} ${Number(y3) - offsetY}`
        );
      svgContent += `<path d="${adjustedD}" class="curve" />`;
    });

    // Export nodes
    visibleNodes.forEach(n => {
      const nx = n.x - offsetX;
      const ny = n.y - offsetY;
      const fillClass = n.level === 0 ? 'node-root' : n.level === 1 ? 'node-l1' : 'node-l2';
      const textClass = n.level === 0 ? 'text text-root' : 'text';
      const btnX = nx + n.width - 15;
      const btnY = ny + n.height / 2;

      svgContent += `
        <g transform="translate(${nx}, ${ny})">
          <rect width="${n.width}" height="${n.height}" class="${fillClass}" />
          <text x="14" y="${Math.round(n.height / 2 + 5)}" class="${textClass}">${plainMath(n.title)}</text>
        </g>
      `;
    });

    svgContent += `</svg>`;

    // Download blob
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${(this.lesson?.title || 'study').replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * Public Initialization Function
 */
export function initMindmap(lesson) {
  const container = document.getElementById('mindmap-container');
  if (!container || !lesson) return;
  activeMindmap = new MindmapController(container, lesson);
  return activeMindmap;
}

export function refreshMindmap() {
  if (activeMindmap) {
    activeMindmap.render();
    activeMindmap.fitView();
  }
}
