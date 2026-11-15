(() => {
  const $ = window.jQuery;
  if (!$) {
    document.body.innerHTML = '<main class="load-error"><h1>Playground unavailable</h1><p>Connect to the internet to load the guest playground.</p></main>';
    return;
  }

  const canvas = $('#world').get(0);
  const context = canvas.getContext('2d');
  const columns = 12;
  const rows = 9;
  const saveKey = 'openblocks-guest-world-v1';
  const materials = {
    grass: { name: 'Grass', category: 'ground', top: '#76c95a', side: '#4e9a43', height: 15, pattern: 'speckle', icon: '✿' },
    dirt: { name: 'Soil', category: 'ground', top: '#b48050', side: '#855634', height: 17, pattern: 'speckle', icon: '▪' },
    stone: { name: 'Stone', category: 'stone', top: '#aab8c0', side: '#748590', height: 22, pattern: 'stone', icon: '◆' },
    wood: { name: 'Wood', category: 'building', top: '#c78a4d', side: '#89562f', height: 24, pattern: 'wood', icon: '▤' },
    brick: { name: 'Brick', category: 'building', top: '#d27857', side: '#9d4e3b', height: 23, pattern: 'masonry', icon: '▦' },
    crystal: { name: 'Crystal', category: 'special', top: '#bb8ce5', side: '#795fc0', height: 28, pattern: 'glow', icon: '✦' },
    water: { name: 'Water', category: 'ground', top: '#43b9e5', side: '#277fac', height: 5, pattern: 'water', icon: '≈' },
    asphalt: { name: 'Asphalt', category: 'ground', top: '#50585d', side: '#333a3f', height: 17, pattern: 'speckle', icon: '▪' },
    basalt: { name: 'Basalt', category: 'stone', top: '#525762', side: '#363a44', height: 23, pattern: 'stone', icon: '◆' },
    cardboard: { name: 'Cardboard', category: 'building', top: '#c99b65', side: '#9d744c', height: 18, pattern: 'weave', icon: '▤' },
    carpet: { name: 'Carpet', category: 'ground', top: '#b64c62', side: '#863849', height: 8, pattern: 'weave', icon: '▧' },
    ceramic_tiles: { name: 'Ceramic Tiles', category: 'building', top: '#e5eceb', side: '#abbcbd', height: 19, pattern: 'tiles', icon: '▦' },
    clay_roof_tiles: { name: 'Clay Roof Tiles', category: 'building', top: '#d97850', side: '#a84e37', height: 22, pattern: 'roof', icon: '▥' },
    cobblestone: { name: 'Cobblestone', category: 'stone', top: '#92918b', side: '#6f706c', height: 21, pattern: 'stone', icon: '◆' },
    corroded_metal: { name: 'Corroded Metal', category: 'metal', top: '#8a7452', side: '#615443', height: 22, pattern: 'metal', icon: '▦' },
    cracked_lava: { name: 'Cracked Lava', category: 'special', top: '#462c36', side: '#30202a', height: 25, pattern: 'lava', icon: '♨' },
    diamond_plate: { name: 'Diamond Plate', category: 'metal', top: '#9baab0', side: '#667983', height: 20, pattern: 'diamond', icon: '◇' },
    fabric: { name: 'Fabric', category: 'building', top: '#6498c5', side: '#456b91', height: 12, pattern: 'weave', icon: '▧' },
    foil: { name: 'Foil', category: 'metal', top: '#c6d9db', side: '#91aeb4', height: 13, pattern: 'metal', icon: '✧' },
    force_field: { name: 'Force Field', category: 'special', top: '#54d7d2', side: '#3698a5', height: 26, pattern: 'glow', icon: '⬡' },
    glacier: { name: 'Glacier', category: 'stone', top: '#a8e8ee', side: '#70b5c5', height: 23, pattern: 'glass', icon: '❄' },
    glass: { name: 'Glass', category: 'special', top: '#a5e8ed', side: '#5cb6c5', height: 20, pattern: 'glass', icon: '◇' },
    ground: { name: 'Ground', category: 'ground', top: '#91794f', side: '#685639', height: 16, pattern: 'speckle', icon: '▪' },
    ice: { name: 'Ice', category: 'stone', top: '#b9f4f4', side: '#79cad6', height: 21, pattern: 'glass', icon: '❄' },
    leather: { name: 'Leather', category: 'building', top: '#9b624c', side: '#704536', height: 18, pattern: 'weave', icon: '▧' },
    limestone: { name: 'Limestone', category: 'stone', top: '#d6c99d', side: '#a99b73', height: 20, pattern: 'stone', icon: '◆' },
    marble: { name: 'Marble', category: 'stone', top: '#e2e1da', side: '#aaaeb0', height: 22, pattern: 'marble', icon: '◇' },
    metal: { name: 'Metal', category: 'metal', top: '#7f9ba6', side: '#536c77', height: 22, pattern: 'metal', icon: '▦' },
    mud: { name: 'Mud', category: 'ground', top: '#755139', side: '#543823', height: 15, pattern: 'speckle', icon: '▪' },
    neon: { name: 'Neon', category: 'special', top: '#ed64dc', side: '#a738ba', height: 25, pattern: 'glow', icon: '✦' },
    pavement: { name: 'Pavement', category: 'ground', top: '#888d8c', side: '#656d70', height: 16, pattern: 'tiles', icon: '▦' },
    pebble: { name: 'Pebble', category: 'stone', top: '#99a39b', side: '#6f7a76', height: 17, pattern: 'stone', icon: '◆' },
    plaster: { name: 'Plaster', category: 'building', top: '#e3d8bf', side: '#b8aa91', height: 18, pattern: 'speckle', icon: '▤' },
    plastic: { name: 'Plastic', category: 'metal', top: '#e8875f', side: '#b65841', height: 20, pattern: 'smooth', icon: '▧' },
    roof_shingles: { name: 'Roof Shingles', category: 'building', top: '#7c5965', side: '#543d48', height: 21, pattern: 'roof', icon: '▥' },
    rubber: { name: 'Rubber', category: 'metal', top: '#343b45', side: '#20262f', height: 17, pattern: 'weave', icon: '▪' },
    salt: { name: 'Salt', category: 'ground', top: '#e9e9dc', side: '#b8bdb2', height: 14, pattern: 'speckle', icon: '✧' },
    sand: { name: 'Sand', category: 'ground', top: '#e7cc7c', side: '#c3a95f', height: 15, pattern: 'speckle', icon: '▪' },
    sandstone: { name: 'Sandstone', category: 'stone', top: '#d39a67', side: '#a96f49', height: 21, pattern: 'stone', icon: '◆' },
    smooth_plastic: { name: 'Smooth Plastic', category: 'metal', top: '#a2c5de', side: '#6e95b4', height: 20, pattern: 'smooth', icon: '▧' },
    snow: { name: 'Snow', category: 'ground', top: '#f3fbff', side: '#b6d6e5', height: 15, pattern: 'glass', icon: '❄' },
    wood_planks: { name: 'Wood Planks', category: 'building', top: '#b87a42', side: '#80502e', height: 21, pattern: 'wood', icon: '▤' },
  };
  const categoryLabels = { ground: 'Ground', stone: 'Stone', building: 'Building', metal: 'Metal & plastic', special: 'Special' };
  const groundColors = { grass: '#67bd59', dirt: '#b88a5c', stone: '#98a9af', water: '#47bde6', sand: '#e4c675' };
  const savedKey = 'openblocks-guest-world-v1';
  const palette = $('#materials');
  let selectedMaterial = 'grass';
  let selectedTool = 'build';
  let activePointerTool = 'build';
  let selectedTile = [5, 4];
  let history = [];
  let pointerDown = false;
  let toastTimer;
  let geometry;

  function hash(x, y, salt = 0) {
    const value = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453;
    return value - Math.floor(value);
  }

  function createStarterWorld(randomize = false) {
    const nextWorld = Array.from({ length: rows }, (_, y) =>
      Array.from({ length: columns }, (_, x) => {
        let ground = 'grass';
        if (x > 7 && x < 10 && y > 0 && y < rows - 1) ground = 'water';
        if (y === 6 && x > 1 && x < 8) ground = 'dirt';
        if (x === 3 && y === 6) ground = 'sand';
        if (randomize && ground === 'grass' && hash(x, y, 4) > 0.9) ground = 'dirt';
        return { ground, block: null };
      }),
    );
    if (!randomize) {
      placeStarterTree(nextWorld, 2, 3);
      placeStarterTree(nextWorld, 10, 2);
      for (let x = 4; x < 7; x += 1) {
        nextWorld[4][x].block = { material: 'brick' };
        nextWorld[3][x].block = { material: 'brick' };
      }
      for (let x = 4; x < 7; x += 1) nextWorld[2][x].block = { material: 'wood' };
      nextWorld[5][9].block = { material: 'stone' };
      nextWorld[5][10].block = { material: 'stone' };
      nextWorld[4][10].block = { material: 'crystal' };
    }
    return nextWorld;
  }

  function placeStarterTree(world, x, y) {
    world[y][x].block = { material: 'wood' };
    world[y - 1][x].block = { material: 'wood' };
    for (const [dx, dy] of [[0, -2], [-1, -2], [1, -2], [0, -3], [0, -1], [1, -1]]) {
      const leafX = x + dx;
      const leafY = y + dy;
      if (world[leafY]?.[leafX]) world[leafY][leafX].block = { material: 'grass' };
    }
  }

  function renderMaterials() {
    const query = $('#material-search').val().trim().toLowerCase();
    const category = $('#material-category').val();
    const filtered = Object.entries(materials).filter(([, material]) =>
      (category === 'all' || material.category === category) && material.name.toLowerCase().includes(query),
    );
    palette.empty();
    for (const [key, material] of filtered) {
      const $button = $('<button>', {
        type: 'button',
        class: `material-button${key === selectedMaterial ? ' is-selected' : ''}`,
        'aria-pressed': String(key === selectedMaterial),
        'aria-label': `${material.name}, ${categoryLabels[material.category]}`,
        title: `${material.name} · ${categoryLabels[material.category]}`,
      }).attr('data-material', key);
      const $swatch = $('<span>', { class: 'swatch' })
        .css('--material-color', material.top)
        .css('--material-light', shade(material.top, 25))
        .text(material.icon);
      $button.append($swatch, $('<span>').text(material.name));
      palette.append($button);
    }
    $('#material-count').text(String(filtered.length).padStart(2, '0'));
    $('#material-results').text(`${filtered.length} of ${Object.keys(materials).length} materials`);
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const tileWidth = Math.min(60, ((rect.width - 30) * 2) / (columns + rows));
    const tileHeight = tileWidth * 0.52;
    geometry = {
      width: rect.width,
      height: rect.height,
      halfWidth: tileWidth / 2,
      halfHeight: tileHeight / 2,
      centerX: rect.width / 2,
      originY: Math.max(44, (rect.height - ((columns + rows - 2) * tileHeight / 2 + tileHeight + 32)) / 2 + 32),
    };
    drawWorld();
  }

  function tileCenter(x, y) {
    return {
      x: geometry.centerX + (x - y) * geometry.halfWidth,
      y: geometry.originY + (x + y) * geometry.halfHeight,
    };
  }

  function diamond(cx, cy, hw, hh, fill, stroke = '#ffffff46') {
    context.beginPath();
    context.moveTo(cx, cy - hh);
    context.lineTo(cx + hw, cy);
    context.lineTo(cx, cy + hh);
    context.lineTo(cx - hw, cy);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    context.strokeStyle = stroke;
    context.lineWidth = 1;
    context.stroke();
  }

  function drawGround(x, y, cell) {
    const center = tileCenter(x, y);
    diamond(center.x, center.y, geometry.halfWidth, geometry.halfHeight, groundColors[cell.ground] || groundColors.grass);
    context.save();
    context.beginPath();
    context.moveTo(center.x, center.y - geometry.halfHeight);
    context.lineTo(center.x + geometry.halfWidth, center.y);
    context.lineTo(center.x, center.y + geometry.halfHeight);
    context.lineTo(center.x - geometry.halfWidth, center.y);
    context.closePath();
    context.clip();
    for (let i = 0; i < 4; i += 1) {
      const px = center.x + (hash(x, y, i) - 0.5) * geometry.halfWidth * 1.4;
      const py = center.y + (hash(x + i, y + 2, i) - 0.5) * geometry.halfHeight * 1.3;
      context.fillStyle = cell.ground === 'water' ? '#b9f4ff99' : '#f5ffd036';
      context.beginPath();
      context.ellipse(px, py, cell.ground === 'water' ? 5 : 1.4, 1.2, 0, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  function polygon(points, fill, stroke = '#ffffff35') {
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) context.lineTo(points[i][0], points[i][1]);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    context.strokeStyle = stroke;
    context.stroke();
  }

  function drawBlock(x, y, key) {
    const material = materials[key];
    if (!material) return;
    const center = tileCenter(x, y);
    const { halfWidth: hw, halfHeight: hh } = geometry;
    const topY = center.y - material.height;
    polygon([[center.x - hw, topY], [center.x, topY + hh], [center.x, center.y + hh], [center.x - hw, center.y]], material.side);
    polygon([[center.x + hw, topY], [center.x, topY + hh], [center.x, center.y + hh], [center.x + hw, center.y]], shade(material.side, -12), '#ffffff24');
    diamond(center.x, topY, hw, hh, material.top, '#ffffff90');
    drawPattern(center.x, topY, hw, hh, material.pattern, x, y);
  }

  function drawPattern(cx, cy, hw, hh, pattern, tileX, tileY) {
    context.save();
    context.beginPath();
    context.moveTo(cx, cy - hh);
    context.lineTo(cx + hw, cy);
    context.lineTo(cx, cy + hh);
    context.lineTo(cx - hw, cy);
    context.closePath();
    context.clip();
    context.globalAlpha = pattern === 'glow' || pattern === 'lava' ? 0.42 : 0.24;
    context.strokeStyle = pattern === 'glow' || pattern === 'glass' ? '#fff' : '#17364b';
    context.fillStyle = context.strokeStyle;
    context.lineWidth = 1;

    if (pattern === 'wood') {
      for (let i = -2; i <= 2; i += 1) {
        context.beginPath();
        context.ellipse(cx + i * 3, cy, 5 + Math.abs(i) * 4, hh * 0.8, 0, 0, Math.PI * 2);
        context.stroke();
      }
    } else if (pattern === 'masonry' || pattern === 'tiles') {
      const step = pattern === 'tiles' ? 0.42 : 0.56;
      for (let row = -1; row < 2; row += 1) {
        const offset = pattern === 'masonry' && (row + tileY) % 2 ? hw * 0.45 : 0;
        context.beginPath();
        context.moveTo(cx - hw + offset, cy + row * hh * step);
        context.lineTo(cx + hw + offset, cy + row * hh * step);
        context.moveTo(cx + offset, cy + row * hh * step - hh * step / 2);
        context.lineTo(cx + offset, cy + row * hh * step + hh * step / 2);
        context.stroke();
      }
    } else if (pattern === 'roof') {
      for (let row = -1; row <= 1; row += 1) {
        for (let col = -1; col <= 1; col += 1) {
          context.beginPath();
          context.arc(cx + col * hw * 0.55 + (row % 2) * hw * 0.25, cy + row * hh * 0.45, hw * 0.34, Math.PI, Math.PI * 2);
          context.stroke();
        }
      }
    } else if (pattern === 'weave') {
      for (let i = -2; i <= 2; i += 1) {
        context.beginPath();
        context.moveTo(cx - hw, cy + i * hh * 0.38);
        context.lineTo(cx + hw, cy + i * hh * 0.38);
        context.moveTo(cx + i * hw * 0.38, cy - hh);
        context.lineTo(cx + i * hw * 0.38, cy + hh);
        context.stroke();
      }
    } else if (pattern === 'stone' || pattern === 'speckle') {
      for (let i = 0; i < 8; i += 1) {
        const px = cx + (hash(tileX, tileY, i) - 0.5) * hw * 1.3;
        const py = cy + (hash(tileY, tileX, i + 3) - 0.5) * hh * 1.2;
        context.beginPath();
        context.arc(px, py, pattern === 'stone' ? 1.8 : 1.2, 0, Math.PI * 2);
        context.fill();
      }
    } else if (pattern === 'marble') {
      context.beginPath();
      context.moveTo(cx - hw, cy + hh * 0.35);
      context.bezierCurveTo(cx - hw * 0.25, cy - hh, cx + hw * 0.1, cy + hh, cx + hw, cy - hh * 0.25);
      context.stroke();
      context.beginPath();
      context.moveTo(cx - hw * 0.7, cy - hh * 0.5);
      context.quadraticCurveTo(cx, cy + hh * 0.1, cx + hw * 0.8, cy + hh * 0.5);
      context.stroke();
    } else if (pattern === 'metal' || pattern === 'diamond') {
      for (let i = -2; i <= 2; i += 1) {
        context.beginPath();
        context.moveTo(cx - hw, cy + i * 5 + hh);
        context.lineTo(cx + hw, cy + i * 5 - hh);
        context.stroke();
      }
    } else if (pattern === 'glass' || pattern === 'glow') {
      context.globalAlpha = 0.5;
      context.beginPath();
      context.moveTo(cx - hw * 0.55, cy + hh * 0.35);
      context.lineTo(cx, cy - hh * 0.65);
      context.lineTo(cx + hw * 0.18, cy + hh * 0.2);
      context.closePath();
      context.fill();
      context.beginPath();
      context.moveTo(cx - hw * 0.1, cy + hh * 0.65);
      context.lineTo(cx + hw * 0.64, cy - hh * 0.15);
      context.stroke();
    } else if (pattern === 'lava') {
      context.strokeStyle = '#ffcb52';
      context.lineWidth = 2;
      for (let i = -1; i <= 1; i += 1) {
        context.beginPath();
        context.moveTo(cx + i * 7, cy - hh);
        context.lineTo(cx + i * 4 - 2, cy - 2);
        context.lineTo(cx + i * 9 + 3, cy + hh);
        context.stroke();
      }
    } else if (pattern === 'water') {
      for (let i = -1; i <= 1; i += 1) {
        context.beginPath();
        context.ellipse(cx, cy + i * 5, hw * 0.34, 1.5, 0, 0, Math.PI * 2);
        context.stroke();
      }
    }
    context.restore();
  }

  function shade(hex, amount) {
    const value = Number.parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, ((value >> 16) & 255) + amount));
    const g = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (value & 255) + amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  function drawWorld() {
    if (!geometry) return;
    context.clearRect(0, 0, geometry.width, geometry.height);
    const gradient = context.createLinearGradient(0, 0, 0, geometry.height);
    const themes = { day: ['#9de2f3', '#d7f3e7'], dusk: ['#9881c7', '#f4c18f'], night: ['#233d70', '#71879d'] };
    const sky = themes[$('body').attr('data-theme')] || themes.day;
    gradient.addColorStop(0, sky[0]);
    gradient.addColorStop(1, sky[1]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, geometry.width, geometry.height);

    for (let sum = 0; sum < columns + rows - 1; sum += 1) {
      for (let x = 0; x < columns; x += 1) {
        const y = sum - x;
        if (y >= 0 && y < rows) drawGround(x, y, world[y][x]);
      }
    }
    for (let sum = 0; sum < columns + rows - 1; sum += 1) {
      for (let x = 0; x < columns; x += 1) {
        const y = sum - x;
        if (y >= 0 && y < rows && world[y][x].block) drawBlock(x, y, world[y][x].block.material);
      }
    }
    drawSelection();
    updateBlockCount();
  }

  function drawSelection() {
    const center = tileCenter(selectedTile[0], selectedTile[1]);
    context.save();
    context.beginPath();
    context.moveTo(center.x, center.y - geometry.halfHeight);
    context.lineTo(center.x + geometry.halfWidth, center.y);
    context.lineTo(center.x, center.y + geometry.halfHeight);
    context.lineTo(center.x - geometry.halfWidth, center.y);
    context.closePath();
    context.strokeStyle = '#fff';
    context.lineWidth = 2;
    context.setLineDash([5, 3]);
    context.stroke();
    context.restore();
  }

  function pointToTile(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const dx = (px - geometry.centerX) / geometry.halfWidth;
    const dy = (py - geometry.originY) / geometry.halfHeight;
    const x = Math.round((dx + dy) / 2);
    const y = Math.round((dy - dx) / 2);
    return x >= 0 && x < columns && y >= 0 && y < rows ? { x, y } : null;
  }

  function editTile(tile, tool = selectedTool) {
    if (!tile) return;
    const cell = world[tile.y][tile.x];
    const before = JSON.parse(JSON.stringify(cell));
    if (tool === 'erase') {
      if (!cell.block) return;
      cell.block = null;
    } else {
      if (cell.block?.material === selectedMaterial) return;
      cell.block = { material: selectedMaterial };
    }
    history.push({ x: tile.x, y: tile.y, before });
    if (history.length > 80) history.shift();
    $('#undo').prop('disabled', false);
    selectedTile = [tile.x, tile.y];
    $('#coordinates').text(`x: ${tile.x + 1} · y: ${tile.y + 1}`);
    drawWorld();
    saveLocally();
  }

  function undo() {
    const action = history.pop();
    if (!action) return;
    world[action.y][action.x] = action.before;
    $('#undo').prop('disabled', history.length === 0);
    drawWorld();
    saveLocally();
    showToast('Last block change undone');
  }

  function saveLocally() {
    try {
      localStorage.setItem(saveKey, JSON.stringify(world));
      $('#save-indicator').html('<i></i> SAVED LOCALLY');
    } catch {
      $('#save-indicator').html('<i></i> TEMPORARY SESSION');
    }
  }

  function loadSavedWorld() {
    try {
      const saved = JSON.parse(localStorage.getItem(saveKey));
      if (Array.isArray(saved) && saved.length === rows && saved.every((row) => Array.isArray(row) && row.length === columns)) world = saved;
    } catch {
      localStorage.removeItem(saveKey);
    }
  }

  function showToast(message) {
    const $toast = $('#toast');
    $toast.text(message).addClass('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => $toast.removeClass('is-visible'), 1500);
  }

  $('#material-search').on('input', renderMaterials);
  $('#material-category').on('change', renderMaterials);
  palette.on('click', '.material-button', function () {
    selectedMaterial = $(this).data('material');
    $('.material-button').removeClass('is-selected').attr('aria-pressed', 'false');
    $(this).addClass('is-selected').attr('aria-pressed', 'true');
    $('#tool-hint').text(`Selected ${materials[selectedMaterial].name}. Tap a tile to build.`);
  });
  $('.tool-button').on('click', function () {
    selectedTool = $(this).data('tool');
    $('.tool-button').removeClass('is-active').attr('aria-pressed', 'false');
    $(this).addClass('is-active').attr('aria-pressed', 'true');
    $('#tool-hint').text(selectedTool === 'erase' ? 'Tap a block to remove it.' : `Selected ${materials[selectedMaterial].name}. Tap a tile to build.`);
    $('#world').toggleClass('erase-mode', selectedTool === 'erase');
  });

  $('#world').on('pointerdown', (event) => {
    if (event.button !== 0 && event.button !== 2) return;
    event.preventDefault();
    pointerDown = true;
    activePointerTool = event.button === 2 ? 'erase' : selectedTool;
    editTile(pointToTile(event.clientX, event.clientY), activePointerTool);
  }).on('pointermove', (event) => {
    if (pointerDown) editTile(pointToTile(event.clientX, event.clientY), activePointerTool);
  }).on('pointerup pointercancel pointerleave contextmenu dragstart', (event) => {
    event.preventDefault();
    pointerDown = false;
  });
  $(document).on('pointerup', () => { pointerDown = false; });
  $(document).on('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      undo();
    }
    if (document.activeElement !== canvas) return;
    const [x, y] = selectedTile;
    if (event.key.startsWith('Arrow')) {
      event.preventDefault();
      if (event.key === 'ArrowLeft') selectedTile[0] = Math.max(0, x - 1);
      if (event.key === 'ArrowRight') selectedTile[0] = Math.min(columns - 1, x + 1);
      if (event.key === 'ArrowUp') selectedTile[1] = Math.max(0, y - 1);
      if (event.key === 'ArrowDown') selectedTile[1] = Math.min(rows - 1, y + 1);
      drawWorld();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      editTile({ x, y });
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      editTile({ x, y }, 'erase');
    }
  });

  $('#undo').on('click', undo);
  $('#reset-world').on('click', () => {
    world = createStarterWorld();
    history = [];
    $('#undo').prop('disabled', true);
    drawWorld();
    saveLocally();
    showToast('Starter world restored');
  });
  $('#new-world').on('click', () => {
    world = createStarterWorld(true);
    history = [];
    $('#undo').prop('disabled', true);
    drawWorld();
    saveLocally();
    showToast('Fresh island generated');
  });
  $('#save-world').on('click', () => {
    const blob = new Blob([JSON.stringify({ version: 1, world }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'openblocks-guest-world.json';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('World downloaded to this device');
  });
  $('#theme-select').on('change', function () {
    $('body').attr('data-theme', $(this).val());
    drawWorld();
  });
  $('#toggle-tools').on('click', function () {
    const collapsed = $('#tool-panel').toggleClass('is-collapsed').hasClass('is-collapsed');
    $(this).attr('aria-expanded', String(!collapsed));
  });

  renderMaterials();
  loadSavedWorld();
  $('body').addClass('copy-guard-on');
  $(window).on('resize', resizeCanvas);
  resizeCanvas();
  $('#year').text(new Date().getFullYear());
  $('#world').attr('aria-description', 'Guest-only local playground. Use the build and erase tools to edit blocks.');
  $('.brand-mark, .guest-avatar, .swatch, .canvas-stamp').attr('draggable', 'false');
})();
