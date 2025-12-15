    const app = {
      data: { nodes: {}, rootNodes: [] },
      currentNodeId: null,
      sidebarVisible: true,
      rightPanelVisible: true,
      focusedTreeNodeId: null,
      searchVisible: false,
      searchResults: [],
      selectedSearchResultIndex: 0,
      expandedNodes: new Set(), // Mémoriser les nœuds dépliés
      symlinkModalExpandedNodes: new Set(), // État expand/collapse pour la modal symlink
      actionModalExpandedNodes: new Set(), // État expand/collapse pour la modal actions
      showAllTags: false, // Afficher tous les tags du cloud
      viewMode: 'edit', // 'edit' ou 'view' (markdown rendered)

      init() {
        // Charger le mode de vue depuis localStorage
        const savedViewMode = localStorage.getItem('deepmemo_viewMode');
        if (savedViewMode) this.viewMode = savedViewMode;

        // Charger l'état du right panel depuis localStorage
        const savedRightPanelState = localStorage.getItem('deepmemo_rightPanelVisible');
        if (savedRightPanelState !== null) {
          this.rightPanelVisible = savedRightPanelState === 'true';
          // Appliquer l'état initial
          const panel = document.querySelector('.right-panel');
          const externalBtn = document.querySelector('.right-panel-toggle-external');
          if (!this.rightPanelVisible) {
            panel.classList.add('hidden');
            externalBtn.style.display = 'flex';
          } else {
            panel.classList.remove('hidden');
            externalBtn.style.display = 'none';
          }
        }

        this.loadData();
        // Initialiser les backlinks pour les données existantes
        if (this.data.rootNodes.length > 0) {
          this.updateBacklinks();
        }
        this.render();
        this.updateNodeCounter();
        this.setupKeyboardShortcuts();
        if (this.data.rootNodes.length === 0) {
          this.createExampleNodes();
        }
        // Sélectionner le premier nœud racine automatiquement
        if (this.data.rootNodes.length > 0) {
          this.selectNode(this.data.rootNodes[0]);
        }
      },

      createExampleNodes() {
        const w = this.generateId(), n1 = this.generateId(), n2 = this.generateId();
        this.data.nodes[w] = { 
          id: w, 
          title: '👋 Bienvenue', 
          content: 'Bienvenue dans DeepMemo !\n\nUtilise Ctrl+K pour rechercher.\n\nTu peux créer des liens : [[📝 Notes]] et [[💡 Idées]]', 
          children: [n1, n2], 
          parent: null, 
          created: Date.now(), 
          modified: Date.now(), 
          links: ['📝 Notes', '💡 Idées'],
          backlinks: [],
          tags: ['bienvenue', 'guide']
        };
        this.data.nodes[n1] = { 
          id: n1, 
          title: '📝 Notes', 
          content: 'Tes notes ici...\n\nRetour vers [[👋 Bienvenue]]', 
          children: [], 
          parent: w, 
          created: Date.now(), 
          modified: Date.now(), 
          links: ['👋 Bienvenue'],
          backlinks: [w],
          tags: ['note', 'exemple']
        };
        this.data.nodes[n2] = { 
          id: n2, 
          title: '💡 Idées', 
          content: 'Tes idées ici...\n\nVoir aussi [[📝 Notes]]', 
          children: [], 
          parent: w, 
          created: Date.now(), 
          modified: Date.now(), 
          links: ['📝 Notes'],
          backlinks: [w],
          tags: ['idée', 'brainstorming']
        };
        this.data.rootNodes = [w];
        this.updateBacklinks();
        this.saveData();
        // Déplier le nœud de bienvenue par défaut
        this.expandedNodes.add(w);
        this.render();
      },

      generateId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      },

      // Échapper les caractères HTML pour éviter les injections
      escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      },

      setupKeyboardShortcuts() {
        const searchInput = document.getElementById('searchInput');
        const searchModal = document.getElementById('searchModal');

        document.addEventListener('keydown', (e) => {
          if (e.altKey && e.key === 'n') {
            e.preventDefault();
            this.currentNodeId ? this.createChildNode() : this.createRootNode();
            this.showToast('Nouveau nœud créé', '➕');
          }
          if (e.altKey && e.key === 'e') {
            e.preventDefault();
            const editor = document.getElementById('nodeContent');
            if (editor) {
              editor.focus();
              this.showToast('Mode édition', '✏️');
            }
          }
          if (e.key === 'Escape' && this.currentNodeId && !this.searchVisible) {
            e.preventDefault();
            this.goToParent();
          }
          if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            this.openSearch();
          }
          if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !this.searchVisible) {
            this.handleTreeNavigation(e);
          }
        });

        searchInput.addEventListener('input', () => this.performSearch(searchInput.value));
        searchInput.addEventListener('keydown', (e) => this.handleSearchNavigation(e));
        searchModal.addEventListener('click', (e) => {
          if (e.target === searchModal) this.closeSearch();
        });
      },

      handleTreeNavigation(e) {
        const visibleNodes = this.getVisibleTreeNodes();
        if (visibleNodes.length === 0) return;

        if (!this.focusedTreeNodeId) {
          if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
            e.preventDefault();
            this.focusedTreeNodeId = visibleNodes[0];
            this.updateTreeFocus();
          }
          return;
        }

        const currentIndex = visibleNodes.indexOf(this.focusedTreeNodeId);
        if (currentIndex === -1) return;

        switch(e.key) {
          case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < visibleNodes.length - 1) {
              this.focusedTreeNodeId = visibleNodes[currentIndex + 1];
              this.updateTreeFocus();
              this.scrollTreeNodeIntoView(this.focusedTreeNodeId);
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
              this.focusedTreeNodeId = visibleNodes[currentIndex - 1];
              this.updateTreeFocus();
              this.scrollTreeNodeIntoView(this.focusedTreeNodeId);
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.expandTreeNode(this.focusedTreeNodeId);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            this.collapseTreeNode(this.focusedTreeNodeId);
            break;
          case 'Enter':
            e.preventDefault();
            this.selectNode(this.focusedTreeNodeId);
            break;
        }
      },

      getVisibleTreeNodes() {
        const visible = [];
        const traverse = (nodeId) => {
          visible.push(nodeId);
          const node = this.data.nodes[nodeId];
          const element = document.querySelector(`[data-node-id="${nodeId}"]`);
          const parent = element?.closest('.tree-node');

          // Trouver les symlinks dans ce nœud
          const symlinksInThisNode = [];
          Object.values(this.data.nodes).forEach(n => {
            if (n.symlinkedIn && n.symlinkedIn.includes(nodeId)) {
              symlinksInThisNode.push(n.id);
            }
          });

          const hasChildren = node.children.length > 0 || symlinksInThisNode.length > 0;

          if (hasChildren && parent?.classList.contains('expanded')) {
            // Traverser les enfants directs
            node.children.forEach(childId => traverse(childId));
            // Traverser les symlinks
            symlinksInThisNode.forEach(symlinkId => traverse(symlinkId));
          }
        };

        this.data.rootNodes.forEach(nodeId => traverse(nodeId));

        // Ajouter les symlinks à la racine
        Object.values(this.data.nodes).forEach(node => {
          if (node.symlinkedIn && node.symlinkedIn.includes(null)) {
            traverse(node.id);
          }
        });

        return visible;
      },

      updateTreeFocus() {
        document.querySelectorAll('.tree-node-content').forEach(el => el.classList.remove('focused'));
        if (this.focusedTreeNodeId) {
          const element = document.querySelector(`[data-node-id="${this.focusedTreeNodeId}"]`);
          if (element) element.classList.add('focused');
        }
      },

      scrollTreeNodeIntoView(nodeId) {
        const element = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (element) element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      },

      // Déplier le chemin complet vers un nœud
      expandPathToNode(nodeId) {
        const path = [];
        let currentId = nodeId;
        
        // Collecter tous les parents
        while (currentId) {
          const node = this.data.nodes[currentId];
          if (node) {
            if (node.parent !== null) {
              path.unshift(node.parent); // Ajouter le parent (pas le nœud lui-même)
            }
            currentId = node.parent;
          } else break;
        }
        
        // Déplier tous les nœuds du chemin
        path.forEach(id => {
          this.expandedNodes.add(id);
        });
        
        // Sauvegarder
        localStorage.setItem('deepmemo_expanded', JSON.stringify([...this.expandedNodes]));
      },

      expandTreeNode(nodeId) {
        const element = document.querySelector(`[data-node-id="${nodeId}"]`);
        const parent = element?.closest('.tree-node');
        const toggle = element?.querySelector('.tree-node-toggle');
        if (parent && !parent.classList.contains('expanded') && toggle) {
          parent.classList.add('expanded');
          toggle.textContent = '▼';
          this.expandedNodes.add(nodeId); // Sauvegarder l'état
        }
      },

      collapseTreeNode(nodeId) {
        const element = document.querySelector(`[data-node-id="${nodeId}"]`);
        const parent = element?.closest('.tree-node');
        const toggle = element?.querySelector('.tree-node-toggle');
        if (parent && parent.classList.contains('expanded') && toggle) {
          parent.classList.remove('expanded');
          toggle.textContent = '▶';
          this.expandedNodes.delete(nodeId); // Sauvegarder l'état
        }
      },

      openSearch(prefillText = '') {
        this.searchVisible = true;
        const modal = document.getElementById('searchModal');
        const input = document.getElementById('searchInput');
        modal.classList.add('active');
        
        // Pré-remplir si un texte est fourni
        if (prefillText) {
          input.value = prefillText;
          this.performSearch(prefillText);
        } else {
          this.performSearch('');
        }
        
        setTimeout(() => {
          input.focus();
          if (prefillText) {
            input.select(); // Sélectionner le texte pour faciliter la modification
          }
        }, 100);
      },

      closeSearch() {
        this.searchVisible = false;
        const modal = document.getElementById('searchModal');
        const input = document.getElementById('searchInput');
        modal.classList.remove('active');
        input.value = '';
        this.searchResults = [];
        this.selectedSearchResultIndex = 0;
      },

      performSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (!query.trim()) {
          resultsContainer.innerHTML = '<div class="search-empty"><div class="search-empty-icon">💭</div><div>Tape pour rechercher dans tes nœuds</div></div>';
          this.searchResults = [];
          return;
        }

        const results = [];
        const queryLower = query.toLowerCase();

        Object.values(this.data.nodes).forEach(node => {
          const titleMatch = node.title.toLowerCase().includes(queryLower);
          const contentMatch = node.content.toLowerCase().includes(queryLower);
          const tagsMatch = node.tags && node.tags.some(tag => tag.toLowerCase().includes(queryLower));

          if (titleMatch || contentMatch || tagsMatch) {
            const path = this.getNodePath(node.id);
            let preview = '';
            
            // Si match dans les tags, le mentionner
            if (tagsMatch && !titleMatch) {
              const matchingTags = node.tags.filter(tag => tag.toLowerCase().includes(queryLower));
              preview = `🏷️ Tags: ${matchingTags.join(', ')}`;
            } else if (contentMatch) {
              const index = node.content.toLowerCase().indexOf(queryLower);
              const start = Math.max(0, index - 50);
              const end = Math.min(node.content.length, index + query.length + 50);
              preview = (start > 0 ? '...' : '') + node.content.substring(start, end) + (end < node.content.length ? '...' : '');
            } else {
              preview = node.content.substring(0, 100);
            }

            results.push({ 
              id: node.id, 
              title: node.title, 
              path: path, 
              preview: preview, 
              matchInTitle: titleMatch,
              matchInTags: tagsMatch && !titleMatch
            });
          }
        });

        this.searchResults = results;
        this.selectedSearchResultIndex = 0;
        this.renderSearchResults(query);
      },

      getNodePath(nodeId) {
        const path = [];
        let currentId = nodeId;
        while (currentId) {
          const node = this.data.nodes[currentId];
          if (node) {
            path.unshift(node.title);
            currentId = node.parent;
          } else break;
        }
        return path.join(' › ');
      },

      renderSearchResults(query) {
        const resultsContainer = document.getElementById('searchResults');

        if (this.searchResults.length === 0) {
          resultsContainer.innerHTML = `<div class="search-empty"><div class="search-empty-icon">🤷</div><div>Aucun résultat pour "${query}"</div></div>`;
          return;
        }

        let html = '';
        this.searchResults.forEach((result, index) => {
          const isSelected = index === this.selectedSearchResultIndex;
          const titleHighlighted = this.highlightText(result.title, query);
          const previewHighlighted = this.highlightText(result.preview, query);

          html += `
            <div class="search-result-item ${isSelected ? 'selected' : ''}" 
                 onclick="app.selectSearchResult(${index})" data-result-index="${index}">
              <div class="search-result-title">${titleHighlighted}</div>
              <div class="search-result-path">${result.path}</div>
              <div class="search-result-preview">${previewHighlighted}</div>
            </div>
          `;
        });

        resultsContainer.innerHTML = html;
        this.scrollSearchResultIntoView();
      },

      highlightText(text, query) {
        if (!query.trim()) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="search-result-highlight">$1</span>');
      },

      handleSearchNavigation(e) {
        if (this.searchResults.length === 0) return;

        switch(e.key) {
          case 'ArrowDown':
            e.preventDefault();
            this.selectedSearchResultIndex = (this.selectedSearchResultIndex + 1) % this.searchResults.length;
            this.renderSearchResults(document.getElementById('searchInput').value);
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.selectedSearchResultIndex = (this.selectedSearchResultIndex - 1 + this.searchResults.length) % this.searchResults.length;
            this.renderSearchResults(document.getElementById('searchInput').value);
            break;
          case 'Enter':
            e.preventDefault();
            if (this.searchResults[this.selectedSearchResultIndex]) {
              this.selectSearchResult(this.selectedSearchResultIndex);
            }
            break;
          case 'Escape':
            e.preventDefault();
            this.closeSearch();
            break;
        }
      },

      selectSearchResult(index) {
        if (!this.searchResults[index]) return;
        const result = this.searchResults[index];
        this.closeSearch();
        
        // Déplier l'arborescence jusqu'au nœud
        this.expandPathToNode(result.id);
        this.render(); // Re-render pour afficher les nœuds dépliés
        
        this.selectNode(result.id);
        
        // Scroll vers le nœud dans l'arborescence
        setTimeout(() => {
          this.scrollTreeNodeIntoView(result.id);
        }, 100);
        
        this.showToast('Nœud ouvert', '🔍');
      },

      scrollSearchResultIntoView() {
        const selectedElement = document.querySelector('.search-result-item.selected');
        if (selectedElement) selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      },

      goToParent() {
        if (!this.currentNodeId) return;
        const node = this.data.nodes[this.currentNodeId];
        if (node.parent) {
          this.selectNode(node.parent);
          this.showToast('Remonté au parent', '⬆️');
        } else {
          this.showToast('Déjà à la racine', '🏠');
        }
      },

      toggleSidebar() {
        this.sidebarVisible = !this.sidebarVisible;
        const sidebar = document.querySelector('.sidebar');
        const externalBtn = document.querySelector('.sidebar-toggle-external');
        
        sidebar.classList.toggle('hidden');
        
        // Afficher/cacher le bouton externe
        if (this.sidebarVisible) {
          externalBtn.style.display = 'none';
        } else {
          externalBtn.style.display = 'flex';
        }
      },

      toggleRightPanel() {
        this.rightPanelVisible = !this.rightPanelVisible;
        const panel = document.querySelector('.right-panel');
        const externalBtn = document.querySelector('.right-panel-toggle-external');

        panel.classList.toggle('hidden');

        // Afficher/cacher le bouton externe
        if (this.rightPanelVisible) {
          externalBtn.style.display = 'none';
        } else {
          externalBtn.style.display = 'flex';
        }

        // Sauvegarder l'état dans localStorage
        localStorage.setItem('deepmemo_rightPanelVisible', this.rightPanelVisible);
      },

      createRootNode() {
        const id = this.generateId();
        this.data.nodes[id] = {
          id, title: 'Nouveau nœud', content: '', children: [], parent: null,
          created: Date.now(), modified: Date.now(), links: [], tags: []
        };
        this.data.rootNodes.push(id);
        this.saveData();
        this.render();
        this.selectNode(id);
        this.updateNodeCounter();
        
        // Auto-select le titre pour saisie immédiate
        setTimeout(() => {
          const titleInput = document.getElementById('nodeTitle');
          if (titleInput) {
            titleInput.focus();
            titleInput.select();
          }
        }, 100);
      },

      createChildNode() {
        if (!this.currentNodeId) return;
        const id = this.generateId();
        this.data.nodes[id] = {
          id, title: 'Nouvel enfant', content: '', children: [], parent: this.currentNodeId,
          created: Date.now(), modified: Date.now(), links: [], tags: []
        };
        this.data.nodes[this.currentNodeId].children.push(id);
        this.saveData();
        this.render();
        this.updateChildren(); // Rafraîchir la liste des enfants
        this.selectNode(id);
        this.updateNodeCounter();
        
        // Auto-select le titre pour saisie immédiate
        setTimeout(() => {
          const titleInput = document.getElementById('nodeTitle');
          if (titleInput) {
            titleInput.focus();
            titleInput.select();
          }
        }, 100);
      },

      selectNode(id) {
        this.currentNodeId = id;
        this.focusedTreeNodeId = id;
        const node = this.data.nodes[id];

        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('editorContainer').style.display = 'flex';

        document.getElementById('nodeTitle').value = node.title;
        const contentEditor = document.getElementById('nodeContent');
        contentEditor.value = node.content;

        // Auto-resize du textarea
        this.autoResizeTextarea(contentEditor);

        document.getElementById('nodeMeta').textContent =
          `Créé: ${new Date(node.created).toLocaleDateString()}`;

        // Afficher le preview avec liens cliquables si le contenu contient des liens
        const preview = document.getElementById('contentPreview');
        if (node.content && node.content.includes('[[')) {
          preview.style.display = 'block';
          preview.innerHTML = '<strong>🔎 Aperçu avec liens :</strong><br><br>' +
            this.renderContentWithLinks(node.content).replace(/\n/g, '<br>');
        } else {
          preview.style.display = 'none';
        }

        // Déplier l'arborescence pour afficher le nœud sélectionné
        this.expandPathToNode(id);

        this.updateBreadcrumb();
        this.updateChildren();
        this.updateRightPanel();
        this.updateDeleteButton();
        this.updateActionsButton();
        this.renderTags();
        this.updateViewMode(); // Mettre à jour le mode view/edit
        this.render();
      },

      // Auto-resize du textarea selon son contenu et l'espace disponible
      autoResizeTextarea(textarea) {
        if (!textarea) return;

        const childrenSection = document.getElementById('childrenSection');
        const hasChildren = childrenSection && childrenSection.style.display !== 'none';

        // Gérer la classe CSS selon la présence d'enfants
        if (hasChildren) {
          textarea.classList.remove('expanded');
        } else {
          textarea.classList.add('expanded');
        }

        // Calculer la hauteur du textarea
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const minHeight = 100;

        let maxHeight;
        if (hasChildren) {
          // Si on a des enfants, limiter la hauteur pour laisser de la place
          maxHeight = 400;
        } else {
          // Si pas d'enfants, calculer l'espace disponible dans la fenêtre
          const editorContainer = document.getElementById('editorContainer');
          const contentHeader = document.querySelector('.content-header');
          const contentActions = document.querySelector('.content-actions');
          const breadcrumb = document.getElementById('breadcrumb');

          if (editorContainer && contentHeader && contentActions && breadcrumb) {
            const windowHeight = window.innerHeight;
            const usedHeight = breadcrumb.offsetHeight + contentHeader.offsetHeight + contentActions.offsetHeight + 100; // marges + padding
            const availableHeight = windowHeight - usedHeight;
            maxHeight = Math.floor(Math.max(400, availableHeight));
          } else {
            maxHeight = 400;
          }
        }

        textarea.style.height = Math.floor(Math.min(Math.max(scrollHeight, minHeight), maxHeight)) + 'px';
      },

      updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        const path = [];
        let currentId = this.currentNodeId;

        while (currentId) {
          const node = this.data.nodes[currentId];
          if (node) {
            path.unshift({ id: currentId, title: node.title });
            currentId = node.parent;
          } else break;
        }

        let html = '<span class="breadcrumb-item" onclick="app.selectNode(null)">🏠</span>';
        path.forEach((item, index) => {
          if (index > 0) html += '<span class="breadcrumb-separator">›</span>';
          const isCurrent = index === path.length - 1;
          html += `<span class="breadcrumb-item ${isCurrent ? 'current' : ''}" 
                   ${!isCurrent ? `onclick="app.selectNode('${item.id}')"` : ''}>
                   ${item.title}</span>`;
        });

        breadcrumb.innerHTML = html;
      },

      updateChildren() {
        const node = this.data.nodes[this.currentNodeId];
        const section = document.getElementById('childrenSection');
        const grid = document.getElementById('childrenGrid');

        // Trouver les symlinks qui pointent vers ce nœud
        const symlinks = [];
        Object.values(this.data.nodes).forEach(n => {
          if (n.symlinkedIn && n.symlinkedIn.includes(this.currentNodeId)) {
            symlinks.push(n.id);
          }
        });

        const totalChildren = node.children.length + symlinks.length;

        if (totalChildren === 0) {
          section.style.display = 'none';
          return;
        }

        section.style.display = 'block';
        document.getElementById('childrenCount').textContent = totalChildren;

        grid.innerHTML = '';
        
        // Afficher les enfants réels
        node.children.forEach(childId => {
          const child = this.data.nodes[childId];
          const icon = child.children.length > 0 ? '📂' : '📄';
          const preview = child.content.substring(0, 50) || 'Vide';
          
          const card = document.createElement('div');
          card.className = 'child-card';
          card.onclick = () => this.selectNode(childId);
          
          // Drag & Drop
          card.setAttribute('draggable', 'true');
          card.addEventListener('dragstart', (e) => this.handleDragStart(e, childId));
          card.addEventListener('dragend', (e) => this.handleDragEnd(e));
          card.addEventListener('dragover', (e) => this.handleDragOver(e));
          card.addEventListener('dragleave', (e) => this.handleDragLeave(e));
          card.addEventListener('drop', (e) => this.handleDrop(e, childId));
          
          card.innerHTML = `
            <div class="child-card-icon">${icon}</div>
            <div class="child-card-title">${child.title}</div>
            <div class="child-card-preview">${preview}</div>
          `;
          
          grid.appendChild(card);
        });

        // Afficher les symlinks
        symlinks.forEach(symlinkId => {
          const child = this.data.nodes[symlinkId];
          const icon = '🔗'; // Icône spéciale pour les symlinks
          const preview = child.content.substring(0, 50) || 'Vide';
          
          const card = document.createElement('div');
          card.className = 'child-card symlink-card';
          card.style.border = '1px dashed var(--accent)';
          card.style.opacity = '0.9';
          card.onclick = () => this.selectNode(symlinkId);
          
          // Drag & Drop
          card.setAttribute('draggable', 'true');
          card.addEventListener('dragstart', (e) => this.handleDragStart(e, symlinkId));
          card.addEventListener('dragend', (e) => this.handleDragEnd(e));
          card.addEventListener('dragover', (e) => this.handleDragOver(e));
          card.addEventListener('dragleave', (e) => this.handleDragLeave(e));
          card.addEventListener('drop', (e) => this.handleDrop(e, symlinkId));
          
          card.innerHTML = `
            <div class="child-card-icon">${icon}</div>
            <div class="child-card-title" style="font-style: italic;">${child.title} <span class="symlink-badge">lien</span></div>
            <div class="child-card-preview">${preview}</div>
          `;
          
          grid.appendChild(card);
        });
      },

      updateRightPanel() {
        const node = this.data.nodes[this.currentNodeId];
        const panel = document.getElementById('panelBody');

        let html = '<div class="info-section"><h3>Structure</h3>';
        html += `<div class="info-item"><div class="info-label">Enfants</div>${node.children.length} nœud(s)</div>`;
        
        if (node.parent) {
          const parentNode = this.data.nodes[node.parent];
          html += `<div class="info-item"><div class="info-label">Parent</div>${parentNode.title}</div>`;
        }
        html += '</div>';

        // Section Liens
        html += '<div class="info-section"><h3>🔗 Liens</h3>';
        if (node.links && node.links.length > 0) {
          node.links.forEach(linkTitle => {
            const targetNode = this.findNodeByTitle(linkTitle);
            if (targetNode) {
              html += `<div class="info-item link-item" onclick="app.selectNode('${targetNode.id}')" title="Cliquer pour ouvrir">
                → ${linkTitle}
              </div>`;
            } else {
              html += `<div class="info-item broken-link">→ ${linkTitle} (non trouvé)</div>`;
            }
          });
        } else {
          html += '<div class="info-item" style="opacity: 0.5;">Aucun lien</div>';
        }
        html += '</div>';

        // Section Backlinks
        html += '<div class="info-section"><h3>⬅️ Mentionné dans</h3>';
        if (node.backlinks && node.backlinks.length > 0) {
          node.backlinks.forEach(backlinkId => {
            const sourceNode = this.data.nodes[backlinkId];
            if (sourceNode) {
              html += `<div class="info-item link-item" onclick="app.selectNode('${backlinkId}')" title="Cliquer pour ouvrir">
                ← ${sourceNode.title}
              </div>`;
            }
          });
        } else {
          html += '<div class="info-item" style="opacity: 0.5;">Aucun backlink</div>';
        }
        html += '</div>';

        // Section Symlinks
        html += '<div class="info-section"><h3>🔗 Liens symboliques</h3>';
        if (node.symlinkedIn && node.symlinkedIn.length > 0) {
          html += '<div class="info-label">Ce nœud apparait aussi dans :</div>';
          node.symlinkedIn.forEach(parentId => {
            if (parentId === null) {
              html += `<div class="info-item" style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <span>🏠 Racine</span>
                <button class="btn btn-danger" style="padding: 2px 6px; font-size: 11px; width: auto; min-width: 24px;" onclick="event.stopPropagation(); app.removeSymlink(null)" title="Supprimer ce lien">✕</button>
              </div>`;
            } else {
              const parentNode = this.data.nodes[parentId];
              if (parentNode) {
                html += `<div class="info-item" style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <span class="link-item" onclick="app.selectNode('${parentId}')" style="flex: 1; cursor: pointer;" title="Cliquer pour ouvrir">
                    📂 ${parentNode.title}
                  </span>
                  <button class="btn btn-danger" style="padding: 2px 6px; font-size: 11px; width: auto; min-width: 24px;" onclick="event.stopPropagation(); app.removeSymlink('${parentId}')" title="Supprimer ce lien">✕</button>
                </div>`;
              }
            }
          });
        } else {
          html += '<div class="info-item" style="opacity: 0.5;">Aucun lien symbolique</div>';
        }
        html += '</div>';

        // Section Tags
        html += '<div class="info-section"><h3>🏷️ Tags</h3>';
        if (node.tags && node.tags.length > 0) {
          node.tags.forEach(tag => {
            const escapedTag = this.escapeHtml(tag);
            html += `<div class="info-item link-item" 
                          onclick="app.openSearch('${escapedTag}')"
                          style="cursor: pointer;"
                          title="Cliquer pour rechercher ce tag">
                       🏷️ ${escapedTag}
                     </div>`;
          });
        } else {
          html += '<div class="info-item" style="opacity: 0.5;">Aucun tag</div>';
        }
        html += '</div>';

        // Section Tags Cloud de la branche
        html += '<div class="info-section"><h3>☁️ Tags de la branche</h3>';
        const branchTags = this.collectBranchTags();
        
        if (branchTags.length > 0) {
          // Calculer les tailles pour le cloud (basé sur la fréquence)
          const maxCount = Math.max(...branchTags.map(t => t.count));
          const minSize = 11;
          const maxSize = 18;
          
          const maxTagsToShow = 10;
          const tagsToDisplay = this.showAllTags ? branchTags : branchTags.slice(0, maxTagsToShow);
          const remainingCount = branchTags.length - maxTagsToShow;
          
          html += '<div class="tag-cloud">';
          tagsToDisplay.forEach(item => {
            // Taille proportionnelle à la fréquence
            const size = minSize + ((item.count / maxCount) * (maxSize - minSize));
            const escapedTag = this.escapeHtml(item.tag);
            
            html += `
              <div class="tag-cloud-item" 
                   style="--tag-size: ${size}px;"
                   onclick="app.openSearch('${escapedTag}')"
                   title="${item.count} occurrence(s) - Cliquer pour rechercher">
                🏷️ ${escapedTag}
              </div>
            `;
          });
          
          // Bouton pour afficher plus
          if (!this.showAllTags && remainingCount > 0) {
            html += `
              <div class="tag-cloud-item" 
                   style="--tag-size: 12px; cursor: pointer; background: var(--accent); color: white;"
                   onclick="app.toggleShowAllTags()"
                   title="Afficher ${remainingCount} tag(s) de plus">
                + ${remainingCount}
              </div>
            `;
          }
          
          // Bouton pour afficher moins
          if (this.showAllTags && branchTags.length > maxTagsToShow) {
            html += `
              <div class="tag-cloud-item" 
                   style="--tag-size: 12px; cursor: pointer; background: var(--bg-tertiary);"
                   onclick="app.toggleShowAllTags()"
                   title="Réduire">
                − Réduire
              </div>
            `;
          }
          
          html += '</div>';
        } else {
          html += '<div class="info-item" style="opacity: 0.5;">Aucun tag dans la branche</div>';
        }
        html += '</div>';

        html += '<div class="info-section"><h3>Statistiques</h3>';
        html += `<div class="info-item"><div class="info-label">Caractères</div>${node.content.length}</div>`;
        html += `<div class="info-item"><div class="info-label">Mots</div>${node.content.split(/\s+/).filter(w => w).length}</div>`;
        html += '</div>';

        panel.innerHTML = html;
      },

      saveCurrentNode() {
        if (!this.currentNodeId) return;
        const node = this.data.nodes[this.currentNodeId];
        node.title = document.getElementById('nodeTitle').value;
        node.content = document.getElementById('nodeContent').value;
        node.modified = Date.now();
        
        // Parser les liens dans le contenu
        node.links = this.parseLinks(node.content);
        
        // Mettre à jour tous les backlinks
        this.updateBacklinks();
        
        this.saveData();
        this.render();
        this.updateBreadcrumb();
        this.updateChildren();
        this.updateRightPanel();
      },

      deleteCurrentNode() {
        if (!this.currentNodeId || !confirm('Supprimer ce nœud et tous ses enfants ?')) return;

        const deleteRecursive = (id) => {
          const node = this.data.nodes[id];
          node.children.forEach(childId => deleteRecursive(childId));
          delete this.data.nodes[id];
        };

        const node = this.data.nodes[this.currentNodeId];
        const wasChild = !!node.parent; // Mémoriser si c'était un enfant
        const parentId = node.parent;
        
        if (node.parent) {
          const parent = this.data.nodes[node.parent];
          parent.children = parent.children.filter(id => id !== this.currentNodeId);
        } else {
          this.data.rootNodes = this.data.rootNodes.filter(id => id !== this.currentNodeId);
        }

        deleteRecursive(this.currentNodeId);
        
        // Si on supprime un enfant, sélectionner le parent
        if (wasChild && parentId && this.data.nodes[parentId]) {
          this.selectNode(parentId);
        } else {
          this.currentNodeId = null;
          document.getElementById('emptyState').style.display = 'flex';
          document.getElementById('editorContainer').style.display = 'none';
        }

        this.saveData();
        this.render();
        this.updateNodeCounter();

        this.showToast('Nœud supprimé', '🗑️');
      },

      // Mettre à jour le bouton supprimer selon le contexte
      updateDeleteButton() {
        const deleteBtn = document.getElementById('deleteBtn');
        if (!deleteBtn) return;

        // Vérifier si on regarde un symlink depuis un contexte spécifique
        // Pour l'instant, on laisse toujours "Supprimer le nœud"
        // Un vrai système de contexte viendrait ici
        deleteBtn.textContent = '🗑️ Supprimer';
        deleteBtn.onclick = () => this.deleteCurrentNode();
      },

      // Mettre à jour le bouton Actions selon le contexte (désactiver sur nœud racine)
      updateActionsButton() {
        const node = this.data.nodes[this.currentNodeId];
        if (!node) return;

        // Trouver le bouton Actions dans le HTML
        const actionsButtons = document.querySelectorAll('.content-actions button');
        actionsButtons.forEach(btn => {
          if (btn.textContent.includes('Actions')) {
            // Désactiver si c'est un nœud racine (parent === null)
            if (node.parent === null) {
              btn.disabled = true;
              btn.style.opacity = '0.5';
              btn.style.cursor = 'not-allowed';
            } else {
              btn.disabled = false;
              btn.style.opacity = '1';
              btn.style.cursor = 'pointer';
            }
          }
        });
      },

      // Supprimer uniquement un lien symbolique
      removeSymlink(parentId) {
        if (!this.currentNodeId) return;

        const node = this.data.nodes[this.currentNodeId];
        if (!node.symlinkedIn) return;

        // Retirer le parent de la liste des symlinks
        node.symlinkedIn = node.symlinkedIn.filter(id => id !== parentId);

        this.saveData();
        this.render();
        this.updateChildren(); // Rafraîchir la liste des enfants
        this.updateRightPanel();
        this.showToast('Lien symbolique supprimé', '🔗');
      },

      render() {
        const container = document.getElementById('treeContainer');
        container.innerHTML = '';

        const renderNode = (nodeId, parentContext = null) => {
          const node = this.data.nodes[nodeId];
          const isActive = nodeId === this.currentNodeId;
          const isSymlink = parentContext !== null && this.isSymlinkIn(nodeId, parentContext);

          // Trouver les symlinks qui doivent apparaître dans ce nœud
          const symlinksInThisNode = [];
          Object.values(this.data.nodes).forEach(n => {
            if (n.symlinkedIn && n.symlinkedIn.includes(nodeId)) {
              symlinksInThisNode.push(n.id);
            }
          });

          const hasChildren = node.children.length > 0 || symlinksInThisNode.length > 0;

          const div = document.createElement('div');
          // Utiliser l'état mémorisé au lieu de toujours expanded
          const isExpanded = this.expandedNodes.has(nodeId);
          div.className = 'tree-node' + (isExpanded ? ' expanded' : '');
          if (isSymlink) div.classList.add('symlink-node');

          const content = document.createElement('div');
          content.className = 'tree-node-content' + (isActive ? ' active' : '');
          content.setAttribute('data-node-id', nodeId);
          
          if (hasChildren) {
            const toggle = document.createElement('span');
            toggle.className = 'tree-node-toggle';
            toggle.textContent = isExpanded ? '▼' : '▶';
            toggle.onclick = (e) => {
              e.stopPropagation();
              div.classList.toggle('expanded');
              
              // Sauvegarder l'état
              if (div.classList.contains('expanded')) {
                this.expandedNodes.add(nodeId);
                toggle.textContent = '▼';
              } else {
                this.expandedNodes.delete(nodeId);
                toggle.textContent = '▶';
              }
              
              // Sauvegarder dans localStorage
              localStorage.setItem('deepmemo_expanded', JSON.stringify([...this.expandedNodes]));
            };
            content.appendChild(toggle);
          } else {
            const spacer = document.createElement('span');
            spacer.style.width = '16px';
            content.appendChild(spacer);
          }

          const icon = document.createElement('span');
          icon.className = 'tree-node-icon';
          icon.textContent = isSymlink ? '🔗' : '📄';
          content.appendChild(icon);

          const title = document.createElement('span');
          title.className = 'tree-node-title';
          title.textContent = node.title;
          content.appendChild(title);

          if (isSymlink) {
            const badge = document.createElement('span');
            badge.className = 'symlink-badge';
            badge.textContent = 'lien';
            content.appendChild(badge);
          }

          content.onclick = () => this.selectNode(nodeId);

          // Drag & Drop
          content.setAttribute('draggable', 'true');
          content.addEventListener('dragstart', (e) => this.handleDragStart(e, nodeId));
          content.addEventListener('dragend', (e) => this.handleDragEnd(e));
          content.addEventListener('dragover', (e) => this.handleDragOver(e));
          content.addEventListener('dragleave', (e) => this.handleDragLeave(e));
          content.addEventListener('drop', (e) => this.handleDrop(e, nodeId));

          div.appendChild(content);

          if (hasChildren) {
            const childrenDiv = document.createElement('div');
            childrenDiv.className = 'tree-node-children';
            
            // Ajouter les enfants réels
            node.children.forEach(childId => {
              childrenDiv.appendChild(renderNode(childId, nodeId));
            });
            
            // Ajouter les symlinks
            symlinksInThisNode.forEach(symlinkId => {
              childrenDiv.appendChild(renderNode(symlinkId, nodeId));
            });
            
            div.appendChild(childrenDiv);
          }

          return div;
        };

        // Trouver les symlinks à la racine
        const symlinksAtRoot = [];
        Object.values(this.data.nodes).forEach(node => {
          if (node.symlinkedIn && node.symlinkedIn.includes(null)) {
            symlinksAtRoot.push(node.id);
          }
        });

        // Rendre les nœuds racines
        this.data.rootNodes.forEach(nodeId => {
          container.appendChild(renderNode(nodeId, null));
        });

        // Rendre les symlinks à la racine
        symlinksAtRoot.forEach(nodeId => {
          container.appendChild(renderNode(nodeId, null));
        });
      },

      updateNodeCounter() {
        const count = Object.keys(this.data.nodes).length;
        document.getElementById('nodeCounter').textContent = `${count} nœud${count > 1 ? 's' : ''}`;
      },

      showToast(message, icon) {
        const toast = document.getElementById('toast');
        document.getElementById('toastIcon').textContent = icon;
        document.getElementById('toastMessage').textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      },

      saveData() {
        localStorage.setItem('deepmemo_data', JSON.stringify(this.data));
        // Sauvegarder aussi l'état des nœuds dépliés
        localStorage.setItem('deepmemo_expanded', JSON.stringify([...this.expandedNodes]));
      },

      loadData() {
        const stored = localStorage.getItem('deepmemo_data');
        if (stored) this.data = JSON.parse(stored);
        
        // Restaurer l'état des nœuds dépliés
        const expandedStored = localStorage.getItem('deepmemo_expanded');
        if (expandedStored) {
          this.expandedNodes = new Set(JSON.parse(expandedStored));
        }
      },

      exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deepmemo-export-' + Date.now() + '.json';
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Exporté', '💾');
      },

      importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target.result);
            if (!imported.nodes || !imported.rootNodes) {
              alert('Fichier JSON invalide');
              return;
            }

            const nodeCount = Object.keys(imported.nodes).length;
            if (confirm(`Importer ${nodeCount} nœud(s) ? Cela écrasera tes données actuelles.`)) {
              this.data = imported;
              this.currentNodeId = null;
              this.saveData();
              this.render();
              this.updateNodeCounter();
              
              document.getElementById('emptyState').style.display = 'flex';
              document.getElementById('editorContainer').style.display = 'none';
              
              this.showToast(`${nodeCount} nœud(s) importés`, '📥');
            }
          } catch (err) {
            alert('Erreur lors de l\'import : ' + err.message);
          }
        };
        reader.readAsText(file);
        event.target.value = '';
      },

      // ===== LIENS =====

      // Parser les liens [[comme ça]] dans le contenu
      parseLinks(content) {
        const regex = /\[\[([^\]]+)\]\]/g;
        const links = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
          links.push(match[1].trim());
        }
        return [...new Set(links)]; // Dédupliquer
      },

      // Trouver un nœud par son titre
      findNodeByTitle(title) {
        return Object.values(this.data.nodes).find(
          node => node.title.toLowerCase() === title.toLowerCase()
        );
      },

      // Mettre à jour tous les backlinks
      updateBacklinks() {
        // Reset tous les backlinks
        Object.values(this.data.nodes).forEach(node => {
          if (!node.backlinks) node.backlinks = [];
          node.backlinks = [];
        });

        // Recalculer les backlinks
        Object.values(this.data.nodes).forEach(sourceNode => {
          if (!sourceNode.links) return;
          sourceNode.links.forEach(linkTitle => {
            const targetNode = this.findNodeByTitle(linkTitle);
            if (targetNode) {
              if (!targetNode.backlinks) targetNode.backlinks = [];
              if (!targetNode.backlinks.includes(sourceNode.id)) {
                targetNode.backlinks.push(sourceNode.id);
              }
            }
          });
        });
      },

      // Rendre le contenu avec liens cliquables
      renderContentWithLinks(content) {
        return content.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
          const node = this.findNodeByTitle(title.trim());
          if (node) {
            return `<span class="node-link" onclick="app.selectNode('${node.id}'); event.stopPropagation();">${title}</span>`;
          }
          return `<span class="broken-link" title="Nœud non trouvé">${title}</span>`;
        });
      },

      // ===== SYMLINKS =====

      selectedNodeForSymlink: null,

      // ===== ACTIONS (Déplacer/Lien/Dupliquer) =====

      selectedAction: null,
      selectedDestination: null,

      // Ouvrir la modal d'actions
      openActionModal() {
        if (!this.currentNodeId) return;
        this.selectedAction = null;
        this.selectedDestination = null;
        
        // Reset l'interface
        document.querySelectorAll('#actionMove, #actionLink, #actionDuplicate').forEach(btn => {
          btn.classList.remove('btn');
          btn.classList.add('btn-secondary');
        });
        document.getElementById('actionDescription').textContent = 'Sélectionne une action ci-dessus';
        document.getElementById('confirmActionBtn').disabled = true;
        document.getElementById('actionNodeSelector').innerHTML = '';
        
        document.getElementById('actionModal').classList.add('active');
      },

      // Fermer la modal d'actions
      closeActionModal() {
        document.getElementById('actionModal').classList.remove('active');
        this.selectedAction = null;
        this.selectedDestination = null;
      },

      // Sélectionner une action
      selectAction(action) {
        this.selectedAction = action;
        this.selectedDestination = null;
        
        // Mettre à jour les boutons
        document.querySelectorAll('#actionMove, #actionLink, #actionDuplicate').forEach(btn => {
          btn.classList.remove('btn');
          btn.classList.add('btn-secondary');
        });
        
        const actionBtn = document.getElementById('action' + action.charAt(0).toUpperCase() + action.slice(1));
        actionBtn.classList.remove('btn-secondary');
        actionBtn.classList.add('btn');
        
        // Mettre à jour la description
        const descriptions = {
          move: '↗️ <strong>Déplacer</strong> : Le nœud sera retiré de son emplacement actuel et placé dans la destination.',
          link: '🔗 <strong>Lien symbolique</strong> : Le nœud restera à sa place ET apparaitra aussi dans la destination.',
          duplicate: '📋 <strong>Dupliquer</strong> : Une copie complète sera créée dans la destination (avec tous ses enfants).'
        };
        document.getElementById('actionDescription').innerHTML = descriptions[action];
        
        // Afficher le sélecteur de destination
        this.renderActionNodeSelector();
        
        document.getElementById('confirmActionBtn').disabled = true;
      },

      // Afficher le sélecteur de nœuds pour les actions
      renderActionNodeSelector() {
        const selector = document.getElementById('actionNodeSelector');
        selector.innerHTML = '';
        
        // Fonction récursive pour créer l'arbre
        const renderNode = (nodeId, level = 0) => {
          if (nodeId === this.currentNodeId) return null;
          if (this.isDescendantOf(nodeId, this.currentNodeId)) return null;

          const node = this.data.nodes[nodeId];
          const hasChildren = node.children.length > 0;
          const isExpanded = this.actionModalExpandedNodes.has(nodeId);
          
          const nodeDiv = document.createElement('div');
          nodeDiv.style.marginBottom = '2px';
          
          const contentDiv = document.createElement('div');
          contentDiv.className = 'node-selector-item';
          contentDiv.setAttribute('data-node-id', nodeId);
          contentDiv.style.paddingLeft = (level * 20 + 10) + 'px';
          contentDiv.style.display = 'flex';
          contentDiv.style.alignItems = 'center';
          contentDiv.style.gap = '8px';
          
          if (hasChildren) {
            const toggle = document.createElement('span');
            toggle.style.width = '16px';
            toggle.style.height = '16px';
            toggle.style.display = 'flex';
            toggle.style.alignItems = 'center';
            toggle.style.justifyContent = 'center';
            toggle.style.fontSize = '10px';
            toggle.style.cursor = 'pointer';
            toggle.style.color = 'var(--text-secondary)';
            toggle.textContent = isExpanded ? '▼' : '▶';
            toggle.onclick = (e) => {
              e.stopPropagation();
              if (this.actionModalExpandedNodes.has(nodeId)) {
                this.actionModalExpandedNodes.delete(nodeId);
              } else {
                this.actionModalExpandedNodes.add(nodeId);
              }
              this.renderActionNodeSelector();
            };
            contentDiv.appendChild(toggle);
          } else {
            const spacer = document.createElement('span');
            spacer.style.width = '16px';
            contentDiv.appendChild(spacer);
          }
          
          const icon = document.createElement('span');
          icon.style.fontSize = '16px';
          icon.textContent = hasChildren ? '📂' : '📄';
          contentDiv.appendChild(icon);
          
          const title = document.createElement('span');
          title.textContent = node.title;
          title.style.flex = '1';
          title.style.fontSize = '14px';
          title.style.whiteSpace = 'nowrap';
          title.style.overflow = 'hidden';
          title.style.textOverflow = 'ellipsis';
          contentDiv.appendChild(title);
          
          contentDiv.onclick = () => {
            this.selectActionDestination(nodeId);
          };
          
          nodeDiv.appendChild(contentDiv);
          
          if (hasChildren && isExpanded) {
            const childrenDiv = document.createElement('div');
            node.children.forEach(childId => {
              const childNode = renderNode(childId, level + 1);
              if (childNode) childrenDiv.appendChild(childNode);
            });
            nodeDiv.appendChild(childrenDiv);
          }
          
          return nodeDiv;
        };
        
        const rootDiv = document.createElement('div');
        rootDiv.className = 'node-selector-item';
        rootDiv.style.marginBottom = '8px';
        rootDiv.style.fontWeight = '600';
        rootDiv.innerHTML = '🏠 Racine';
        rootDiv.onclick = () => this.selectActionDestination(null);
        selector.appendChild(rootDiv);
        
        this.data.rootNodes.forEach(nodeId => {
          const nodeElement = renderNode(nodeId, 0);
          if (nodeElement) selector.appendChild(nodeElement);
        });
      },

      // Vérifier si un nœud est descendant d'un autre
      isDescendantOf(nodeId, ancestorId) {
        let current = nodeId;
        while (current) {
          const node = this.data.nodes[current];
          if (!node) return false;
          if (node.parent === ancestorId) return true;
          current = node.parent;
        }
        return false;
      },

      // Sélectionner une destination
      selectActionDestination(targetId) {
        this.selectedDestination = targetId;
        document.querySelectorAll('#actionNodeSelector .node-selector-item').forEach(el => el.classList.remove('selected'));
        // Sélectionner l'élément par son data-node-id
        const selector = targetId === null
          ? '#actionNodeSelector .node-selector-item[style*="font-weight: 600"]' // Racine
          : `#actionNodeSelector .node-selector-item[data-node-id="${targetId}"]`;
        const element = document.querySelector(selector);
        if (element) {
          element.classList.add('selected');
        }
        document.getElementById('confirmActionBtn').disabled = false;
      },

      // Confirmer l'action
      confirmAction() {
        if (!this.selectedAction || this.selectedDestination === undefined) return;

        switch(this.selectedAction) {
          case 'move':
            this.moveNode(this.currentNodeId, this.selectedDestination);
            break;
          case 'link':
            this.createSymlinkTo(this.currentNodeId, this.selectedDestination);
            break;
          case 'duplicate':
            this.duplicateNode(this.currentNodeId, this.selectedDestination);
            break;
        }

        this.closeActionModal();
      },

      // Dupliquer un nœud à une position spécifique (before/after)
      duplicateNodeAt(nodeId, targetId, position) {
        const targetNode = this.data.nodes[targetId];
        const parentId = targetNode.parent;
        
        // Dupliquer le nœud (récursif)
        const duplicateRecursive = (originalId, newParentId) => {
          const original = this.data.nodes[originalId];
          const newId = this.generateId();
          
          this.data.nodes[newId] = {
            id: newId,
            title: original.title + ' (copie)',
            content: original.content,
            children: [],
            parent: newParentId,
            created: Date.now(),
            modified: Date.now(),
            links: [...(original.links || [])],
            tags: [...(original.tags || [])],
            backlinks: []
          };

          // Dupliquer récursivement les enfants
          original.children.forEach(childId => {
            const newChildId = duplicateRecursive(childId, newId);
            this.data.nodes[newId].children.push(newChildId);
          });

          return newId;
        };

        const newNodeId = duplicateRecursive(nodeId, parentId);
        
        // Obtenir le tableau des enfants du parent cible
        let childrenArray;
        if (parentId === null) {
          childrenArray = this.data.rootNodes;
        } else {
          childrenArray = this.data.nodes[parentId].children;
        }
        
        // Trouver la position de la cible
        const targetIndex = childrenArray.indexOf(targetId);
        
        // Insérer selon la position
        if (position === 'before') {
          childrenArray.splice(targetIndex, 0, newNodeId);
        } else { // 'after'
          childrenArray.splice(targetIndex + 1, 0, newNodeId);
        }
        
        this.saveData();
        this.render();
        this.updateChildren();
        this.updateNodeCounter();
        this.showToast('Nœud dupliqué à la position', '📋');
      },

      // Réorganiser l'ordre des nœuds (siblings)
      reorderNodes(draggedId, targetId, position) {
        const draggedNode = this.data.nodes[draggedId];
        const targetNode = this.data.nodes[targetId];
        const newParentId = targetNode.parent; // Parent de la CIBLE
        const oldParentId = draggedNode.parent;
        
        // Retirer le nœud dragué de son ancien parent
        if (oldParentId === null) {
          this.data.rootNodes = this.data.rootNodes.filter(id => id !== draggedId);
        } else {
          this.data.nodes[oldParentId].children = this.data.nodes[oldParentId].children.filter(id => id !== draggedId);
        }
        
        // Obtenir le tableau des enfants du parent de la cible (APRÈS le retrait)
        let childrenArray;
        if (newParentId === null) {
          childrenArray = this.data.rootNodes;
        } else {
          childrenArray = this.data.nodes[newParentId].children;
        }
        
        // Trouver la position de la cible
        const targetIndex = childrenArray.indexOf(targetId);
        
        // Insérer selon la position
        if (position === 'before') {
          childrenArray.splice(targetIndex, 0, draggedId);
        } else { // 'after'
          childrenArray.splice(targetIndex + 1, 0, draggedId);
        }
        
        // Mettre à jour le parent du nœud dragué
        draggedNode.parent = newParentId;
        
        this.saveData();
        this.render();
        this.updateChildren();
        this.showToast('Ordre modifié', '🔄');
      },

      // Déplacer un nœud
      moveNode(nodeId, newParentId) {
        const node = this.data.nodes[nodeId];
        const oldParent = node.parent;

        // Retirer de l'ancien parent
        if (oldParent === null) {
          this.data.rootNodes = this.data.rootNodes.filter(id => id !== nodeId);
        } else {
          const oldParentNode = this.data.nodes[oldParent];
          oldParentNode.children = oldParentNode.children.filter(id => id !== nodeId);
        }

        // Ajouter au nouveau parent
        if (newParentId === null) {
          this.data.rootNodes.push(nodeId);
        } else {
          this.data.nodes[newParentId].children.push(nodeId);
        }

        node.parent = newParentId;

        this.saveData();
        this.render();
        this.updateChildren(); // Rafraîchir la liste des enfants
        this.showToast('Nœud déplacé', '↗️');
      },

      // Créer un symlink (alias de la fonction existante)
      createSymlinkTo(nodeId, parentId) {
        const node = this.data.nodes[nodeId];
        if (!node.symlinkedIn) node.symlinkedIn = [];

        if (parentId === node.parent || node.symlinkedIn.includes(parentId)) {
          this.showToast('Lien déjà existant', '⚠️');
          return;
        }

        node.symlinkedIn.push(parentId);
        this.saveData();
        this.render();
        this.updateChildren(); // Rafraîchir la liste des enfants
        this.updateRightPanel();
        this.showToast('Lien symbolique créé', '🔗');
      },

      // Dupliquer un nœud (récursif avec tous ses enfants)
      duplicateNode(nodeId, newParentId) {
        const duplicateRecursive = (originalId, parentId) => {
          const original = this.data.nodes[originalId];
          const newId = this.generateId();
          
          // Copier le nœud
          this.data.nodes[newId] = {
            id: newId,
            title: original.title + ' (copie)',
            content: original.content,
            children: [],
            parent: parentId,
            created: Date.now(),
            modified: Date.now(),
            links: [...(original.links || [])],
            tags: [...(original.tags || [])],
            backlinks: []
            // Note: on ne copie pas symlinkedIn pour éviter les liens cassés
          };

          // Dupliquer récursivement les enfants
          original.children.forEach(childId => {
            const newChildId = duplicateRecursive(childId, newId);
            this.data.nodes[newId].children.push(newChildId);
          });

          return newId;
        };

        const newNodeId = duplicateRecursive(nodeId, newParentId);

        // Ajouter au parent
        if (newParentId === null) {
          this.data.rootNodes.push(newNodeId);
        } else {
          this.data.nodes[newParentId].children.push(newNodeId);
        }

        this.saveData();
        this.render();
        this.updateChildren(); // Rafraîchir la liste des enfants
        this.updateNodeCounter();
        this.showToast('Nœud dupliqué', '📋');
      },

      // Ouvrir la modal pour créer un symlink
      openSymlinkModal() {
        if (!this.currentNodeId) return;
        this.selectedNodeForSymlink = null;
        this.renderNodeSelector();
        document.getElementById('symlinkModal').classList.add('active');
      },

      // Fermer la modal symlink
      closeSymlinkModal() {
        document.getElementById('symlinkModal').classList.remove('active');
        this.selectedNodeForSymlink = null;
      },

      // Afficher le sélecteur de nœuds
      renderNodeSelector() {
        const selector = document.getElementById('nodeSelector');
        selector.innerHTML = '';
        
        // Fonction récursive pour créer l'arbre
        const renderNode = (nodeId, level = 0) => {
          if (nodeId === this.currentNodeId) return null; // Ne pas lier à soi-même

          const node = this.data.nodes[nodeId];
          const hasChildren = node.children.length > 0;
          const isExpanded = this.symlinkModalExpandedNodes.has(nodeId);
          
          const nodeDiv = document.createElement('div');
          nodeDiv.style.marginBottom = '2px';
          
          const contentDiv = document.createElement('div');
          contentDiv.className = 'node-selector-item';
          contentDiv.setAttribute('data-node-id', nodeId);
          contentDiv.style.paddingLeft = (level * 20 + 10) + 'px';
          contentDiv.style.display = 'flex';
          contentDiv.style.alignItems = 'center';
          contentDiv.style.gap = '8px';
          
          if (hasChildren) {
            const toggle = document.createElement('span');
            toggle.style.width = '16px';
            toggle.style.height = '16px';
            toggle.style.display = 'flex';
            toggle.style.alignItems = 'center';
            toggle.style.justifyContent = 'center';
            toggle.style.fontSize = '10px';
            toggle.style.cursor = 'pointer';
            toggle.style.color = 'var(--text-secondary)';
            toggle.textContent = isExpanded ? '▼' : '▶';
            toggle.onclick = (e) => {
              e.stopPropagation();
              if (this.symlinkModalExpandedNodes.has(nodeId)) {
                this.symlinkModalExpandedNodes.delete(nodeId);
              } else {
                this.symlinkModalExpandedNodes.add(nodeId);
              }
              this.renderNodeSelector();
            };
            contentDiv.appendChild(toggle);
          } else {
            const spacer = document.createElement('span');
            spacer.style.width = '16px';
            contentDiv.appendChild(spacer);
          }
          
          const icon = document.createElement('span');
          icon.style.fontSize = '16px';
          icon.textContent = hasChildren ? '📂' : '📄';
          contentDiv.appendChild(icon);
          
          const title = document.createElement('span');
          title.textContent = node.title;
          title.style.flex = '1';
          title.style.fontSize = '14px';
          title.style.whiteSpace = 'nowrap';
          title.style.overflow = 'hidden';
          title.style.textOverflow = 'ellipsis';
          contentDiv.appendChild(title);
          
          contentDiv.onclick = () => {
            this.selectSymlinkTarget(nodeId);
          };
          
          nodeDiv.appendChild(contentDiv);
          
          if (hasChildren && isExpanded) {
            const childrenDiv = document.createElement('div');
            node.children.forEach(childId => {
              const childNode = renderNode(childId, level + 1);
              if (childNode) childrenDiv.appendChild(childNode);
            });
            nodeDiv.appendChild(childrenDiv);
          }
          
          return nodeDiv;
        };
        
        const rootDiv = document.createElement('div');
        rootDiv.className = 'node-selector-item';
        rootDiv.style.marginBottom = '8px';
        rootDiv.style.fontWeight = '600';
        rootDiv.innerHTML = '🏠 Racine';
        rootDiv.onclick = () => this.selectSymlinkTarget(null);
        selector.appendChild(rootDiv);
        
        this.data.rootNodes.forEach(nodeId => {
          const nodeElement = renderNode(nodeId, 0);
          if (nodeElement) selector.appendChild(nodeElement);
        });
      },



      // Sélectionner une destination pour le symlink
      selectSymlinkTarget(targetId) {
        this.selectedNodeForSymlink = targetId;
        document.querySelectorAll('#nodeSelector .node-selector-item').forEach(el => el.classList.remove('selected'));
        // Sélectionner l'élément par son data-node-id
        const selector = targetId === null
          ? '#nodeSelector .node-selector-item[style*="font-weight: 600"]' // Racine
          : `#nodeSelector .node-selector-item[data-node-id="${targetId}"]`;
        const element = document.querySelector(selector);
        if (element) {
          element.classList.add('selected');
        }
      },

      // Confirmer la création du symlink
      confirmSymlink() {
        if (!this.currentNodeId) return;

        const node = this.data.nodes[this.currentNodeId];
        
        // Initialiser le tableau symlinks si nécessaire
        if (!node.symlinkedIn) node.symlinkedIn = [];

        const targetParent = this.selectedNodeForSymlink;

        // Vérifier qu'on n'est pas déjà dans ce parent
        if (targetParent === node.parent || node.symlinkedIn.includes(targetParent)) {
          this.showToast('Lien déjà existant', '⚠️');
          return;
        }

        // Ajouter le symlink
        node.symlinkedIn.push(targetParent);

        this.saveData();
        this.render();
        this.updateChildren(); // Rafraîchir la liste des enfants
        this.updateRightPanel();
        this.closeSymlinkModal();
        this.showToast('Lien symbolique créé', '🔗');
      },

      // Vérifier si un nœud est un symlink dans un contexte donné
      isSymlinkIn(nodeId, parentId) {
        const node = this.data.nodes[nodeId];
        if (!node.symlinkedIn) return false;
        return node.symlinkedIn.includes(parentId);
      },

      // ===== DRAG & DROP =====

      draggedNodeId: null,
      dragModifiers: { ctrl: false, alt: false, shift: false }, // Stocker les modificateurs
      dropPosition: null, // 'before', 'after', 'inside'

      handleDragStart(e, nodeId) {
        this.draggedNodeId = nodeId;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'all'; // Permettre toutes les actions
        e.dataTransfer.setData('text/plain', nodeId);
        
        // Capturer les modificateurs au début
        this.dragModifiers = {
          ctrl: e.ctrlKey || e.metaKey,
          alt: e.altKey,
          shift: e.shiftKey
        };
      },

      handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        // Supprimer tous les indicateurs
        document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
      },

      handleDragOver(e) {
        e.preventDefault();
        
        // Mettre à jour les modificateurs en temps réel
        this.dragModifiers = {
          ctrl: e.ctrlKey || e.metaKey,
          alt: e.altKey,
          shift: e.shiftKey
        };
        
        // Déterminer l'action selon les modificateurs
        if (this.dragModifiers.ctrl && this.dragModifiers.alt) {
          e.dataTransfer.dropEffect = 'link';
        } else if (this.dragModifiers.ctrl) {
          e.dataTransfer.dropEffect = 'copy';
        } else {
          e.dataTransfer.dropEffect = 'move';
        }
        
        // Supprimer les anciens indicateurs
        document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
        
        const element = e.currentTarget;
        if (element.classList.contains('dragging')) return;
        
        // Calculer la position relative de la souris dans l'élément
        const rect = element.getBoundingClientRect();
        
        // Détecter si c'est une child-card (grille horizontale) ou tree-node (arbre vertical)
        const isChildCard = element.classList.contains('child-card');
        
        if (isChildCard) {
          // GRILLE HORIZONTALE : utiliser mouseX (gauche/droite)
          const mouseX = e.clientX - rect.left;
          const width = rect.width;
          
          if (mouseX < width * 0.33) {
            // Zone gauche : insérer AVANT (à gauche)
            this.dropPosition = 'before';
            const indicator = document.createElement('div');
            indicator.className = 'drop-indicator left';
            element.appendChild(indicator);
          } else if (mouseX > width * 0.67) {
            // Zone droite : insérer APRÈS (à droite)
            this.dropPosition = 'after';
            const indicator = document.createElement('div');
            indicator.className = 'drop-indicator right';
            element.appendChild(indicator);
          } else {
            // Zone milieu : déposer DEDANS
            this.dropPosition = 'inside';
            element.classList.add('drag-over');
          }
        } else {
          // ARBRE VERTICAL : utiliser mouseY (haut/bas)
          const mouseY = e.clientY - rect.top;
          const height = rect.height;
          
          if (mouseY < height * 0.33) {
            // Zone haute : insérer AVANT (au-dessus)
            this.dropPosition = 'before';
            const indicator = document.createElement('div');
            indicator.className = 'drop-indicator top';
            element.appendChild(indicator);
          } else if (mouseY > height * 0.67) {
            // Zone basse : insérer APRÈS (en-dessous)
            this.dropPosition = 'after';
            const indicator = document.createElement('div');
            indicator.className = 'drop-indicator bottom';
            element.appendChild(indicator);
          } else {
            // Zone milieu : déposer DEDANS
            this.dropPosition = 'inside';
            element.classList.add('drag-over');
          }
        }
      },

      handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
        // Ne pas supprimer les indicateurs ici, seulement dans dragOver
      },

      handleDrop(e, targetNodeId) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');
        document.querySelectorAll('.drop-indicator').forEach(el => el.remove());

        const draggedId = this.draggedNodeId;
        const position = this.dropPosition; // 'before', 'after', 'inside'
        
        // Ne rien faire si on drop sur soi-même
        if (draggedId === targetNodeId) return;
        
        // Ne pas permettre de drop sur ses propres descendants
        if (this.isDescendantOf(targetNodeId, draggedId)) {
          this.showToast('Impossible : destination invalide', '⚠️');
          return;
        }

        const { ctrl, alt, shift } = this.dragModifiers;

        // Shift = Ouvrir la modal pour choisir
        if (shift) {
          this.currentNodeId = draggedId;
          this.selectedDestination = targetNodeId;
          this.openDragDropMenu();
          return;
        }

        // Déterminer l'action selon la position et les modificateurs
        if (position === 'before' || position === 'after') {
          // ZONES HAUT/BAS : insérer avant/après
          if (ctrl && !alt) {
            // Ctrl seul : DUPLIQUER et insérer avant/après
            this.duplicateNodeAt(draggedId, targetNodeId, position);
          } else {
            // Par défaut (et Ctrl+Alt) : DÉPLACER et insérer avant/après
            this.reorderNodes(draggedId, targetNodeId, position);
          }
        } else {
          // ZONE MILIEU : déposer DEDANS (changer de parent)
          this.handleInsideAction(draggedId, targetNodeId);
        }
      },

      // Gérer l'action "inside" (déposer dedans)
      handleInsideAction(draggedId, targetNodeId) {
        const { ctrl, alt } = this.dragModifiers;
        
        let action;
        if (ctrl && alt) {
          action = 'link';
        } else if (ctrl) {
          action = 'duplicate';
        } else {
          action = 'move';
        }

        switch(action) {
          case 'move':
            this.moveNode(draggedId, targetNodeId);
            break;
          case 'link':
            this.createSymlinkTo(draggedId, targetNodeId);
            break;
          case 'duplicate':
            this.duplicateNode(draggedId, targetNodeId);
            break;
        }
      },

      openDragDropMenu() {
        // Ouvrir directement la modal d'actions avec la destination pré-sélectionnée
        this.openActionModal();
        
        // Sélectionner automatiquement la destination
        setTimeout(() => {
          const targetElement = document.querySelector(`#actionNodeSelector [data-node-id="${this.selectedDestination}"]`);
          if (targetElement) {
            targetElement.click();
          } else {
            // Si c'est la racine
            if (this.selectedDestination === null) {
              const racineElement = document.querySelector('#actionNodeSelector .node-selector-item');
              if (racineElement) racineElement.click();
            }
          }
        }, 100);
      },

      // ===== TAGS =====

      tagAutocompleteIndex: 0,
      tagAutocompleteSuggestions: [],

      // Gérer l'input des tags (Enter pour ajouter)
      handleTagInput(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          
          // Vérifier si l'autocomplete est visible
          const autocomplete = document.getElementById('tagAutocomplete');
          const isAutocompleteVisible = autocomplete && autocomplete.style.display !== 'none';
          
          // Si l'autocomplete est visible ET qu'on a des suggestions, les utiliser
          if (isAutocompleteVisible && this.tagAutocompleteSuggestions.length > 0) {
            const suggestion = this.tagAutocompleteSuggestions[this.tagAutocompleteIndex];
            if (suggestion) {
              const tagToAdd = suggestion.tag;
              event.target.value = ''; // Vider AVANT addTag
              this.hideTagAutocomplete();
              this.addTag(tagToAdd);
              return;
            }
          }
          
          // Sinon, ajouter le texte tapé
          const tag = event.target.value.trim();
          if (tag) {
            event.target.value = ''; // Vider AVANT addTag
            this.hideTagAutocomplete();
            this.addTag(tag);
          }
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          this.navigateTagAutocomplete(1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          this.navigateTagAutocomplete(-1);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          this.hideTagAutocomplete();
        }
      },

      // Autocomplete des tags
      handleTagAutocomplete(event) {
        const input = event.target.value.trim().toLowerCase();
        if (!input) {
          this.hideTagAutocomplete();
          return;
        }

        // Collecter tous les tags avec priorité aux enfants
        const allTags = this.collectAllTagsForAutocomplete();
        
        // Filtrer par l'input
        const suggestions = allTags
          .filter(t => t.tag.toLowerCase().includes(input))
          .slice(0, 10); // Max 10 suggestions

        if (suggestions.length === 0) {
          this.hideTagAutocomplete();
          return;
        }

        this.tagAutocompleteSuggestions = suggestions;
        this.tagAutocompleteIndex = 0;
        this.renderTagAutocomplete();
      },

      // Collecter TOUS les tags (branche + global) pour l'autocomplete
      collectAllTagsForAutocomplete() {
        const tagMap = new Map();
        
        // 1. Collecter les tags de la branche d'abord
        const collectFromBranch = (nodeId) => {
          const node = this.data.nodes[nodeId];
          if (!node || !node.tags) return;
          
          node.tags.forEach(tag => {
            if (!tagMap.has(tag)) {
              tagMap.set(tag, { tag, count: 0, inBranch: true });
            }
            tagMap.get(tag).count++;
          });
          
          if (node.children) {
            node.children.forEach(childId => collectFromBranch(childId));
          }
        };

        if (this.currentNodeId) {
          collectFromBranch(this.currentNodeId);
        }

        // 2. Collecter tous les autres tags (global)
        Object.values(this.data.nodes).forEach(node => {
          if (!node.tags) return;
          
          // Si ce nœud n'est pas dans la branche
          const isInBranch = node.id === this.currentNodeId || 
                            (this.currentNodeId && this.isDescendantOf(node.id, this.currentNodeId));
          
          if (!isInBranch) {
            node.tags.forEach(tag => {
              if (!tagMap.has(tag)) {
                tagMap.set(tag, { tag, count: 0, inBranch: false });
              }
              if (!tagMap.get(tag).inBranch) {
                tagMap.get(tag).count++;
              }
            });
          }
        });

        // Trier : branche en premier, puis par fréquence
        return Array.from(tagMap.values())
          .sort((a, b) => {
            if (a.inBranch && !b.inBranch) return -1;
            if (!a.inBranch && b.inBranch) return 1;
            return b.count - a.count;
          });
      },

      // Afficher l'autocomplete
      showTagAutocomplete() {
        const input = document.getElementById('tagInput');
        if (input.value.trim()) {
          this.handleTagAutocomplete({ target: input });
        }
      },

      // Cacher l'autocomplete
      hideTagAutocomplete() {
        setTimeout(() => {
          document.getElementById('tagAutocomplete').style.display = 'none';
          // IMPORTANT : Vider les suggestions quand on cache l'autocomplete
          this.tagAutocompleteSuggestions = [];
          this.tagAutocompleteIndex = 0;
        }, 200); // Délai pour permettre le clic
      },

      // Naviguer dans l'autocomplete
      navigateTagAutocomplete(direction) {
        if (this.tagAutocompleteSuggestions.length === 0) return;
        
        this.tagAutocompleteIndex = 
          (this.tagAutocompleteIndex + direction + this.tagAutocompleteSuggestions.length) 
          % this.tagAutocompleteSuggestions.length;
        
        this.renderTagAutocomplete();
      },

      // Afficher les suggestions
      renderTagAutocomplete() {
        const container = document.getElementById('tagAutocomplete');
        
        if (this.tagAutocompleteSuggestions.length === 0) {
          container.style.display = 'none';
          return;
        }

        container.innerHTML = '';
        
        this.tagAutocompleteSuggestions.forEach((item, index) => {
          const isSelected = index === this.tagAutocompleteIndex;
          const badge = item.inBranch ? '🌳 branche' : '🌍 global';
          
          const itemDiv = document.createElement('div');
          itemDiv.className = 'tag-autocomplete-item' + (isSelected ? ' selected' : '');
          itemDiv.onmousedown = () => this.selectTagSuggestion(index);
          
          const tagSpan = document.createElement('span');
          tagSpan.textContent = `🏷️ ${item.tag}`;
          
          const badgeSpan = document.createElement('span');
          badgeSpan.className = 'tag-autocomplete-badge';
          badgeSpan.textContent = `${badge} ×${item.count}`;
          
          itemDiv.appendChild(tagSpan);
          itemDiv.appendChild(badgeSpan);
          container.appendChild(itemDiv);
        });

        container.style.display = 'block';
      },

      // Sélectionner une suggestion
      selectTagSuggestion(index) {
        const suggestion = this.tagAutocompleteSuggestions[index];
        if (suggestion) {
          const input = document.getElementById('tagInput');
          if (input) input.value = ''; // Vider AVANT addTag
          this.hideTagAutocomplete();
          this.addTag(suggestion.tag);
        }
      },

      // Toggle l'affichage de tous les tags
      toggleShowAllTags() {
        this.showAllTags = !this.showAllTags;
        this.updateRightPanel();
      },

      // Collecter tous les tags de la branche avec comptage
      collectBranchTags() {
        const tagMap = new Map();
        
        // Récursif pour collecter les tags des descendants
        const collectFromNode = (nodeId) => {
          const node = this.data.nodes[nodeId];
          if (!node) return;
          
          if (node.tags) {
            node.tags.forEach(tag => {
              if (!tagMap.has(tag)) {
                tagMap.set(tag, { tag, count: 0, inBranch: true });
              }
              const entry = tagMap.get(tag);
              entry.count++;
            });
          }
          
          // Parcourir les enfants RÉCURSIVEMENT
          if (node.children && node.children.length > 0) {
            node.children.forEach(childId => collectFromNode(childId));
          }
        };

        // Commencer par le nœud actuel
        if (this.currentNodeId) {
          collectFromNode(this.currentNodeId);
        }

        // Convertir en array et trier par count
        return Array.from(tagMap.values())
          .sort((a, b) => b.count - a.count);
      },

      // Ajouter un tag
      addTag(tag) {
        if (!this.currentNodeId) return;
        
        const node = this.data.nodes[this.currentNodeId];
        if (!node.tags) node.tags = [];
        
        // Nettoyer le tag (trim et normaliser en lowercase)
        tag = tag.trim().toLowerCase();
        
        if (!tag) return;
        
        // Ne pas ajouter si déjà présent
        if (node.tags.includes(tag)) {
          this.showToast('Tag déjà existant', '⚠️');
          // Remettre le focus quand même
          setTimeout(() => {
            const input = document.getElementById('tagInput');
            if (input) input.focus();
          }, 100);
          return;
        }
        
        node.tags.push(tag);
        this.saveData();
        this.renderTags();
        this.updateRightPanel();
        this.showToast('Tag ajouté', '🏷️');
        
        // Remettre le focus pour continuer à ajouter des tags
        setTimeout(() => {
          const input = document.getElementById('tagInput');
          if (input) input.focus();
        }, 100);
      },

      // Supprimer un tag
      removeTag(tag) {
        if (!this.currentNodeId) return;
        
        const node = this.data.nodes[this.currentNodeId];
        if (!node.tags) return;
        
        node.tags = node.tags.filter(t => t !== tag);
        this.saveData();
        this.renderTags();
        this.updateRightPanel();
        this.showToast('Tag supprimé', '🗑️');
      },

      // Afficher les tags
      renderTags() {
        if (!this.currentNodeId) return;
        
        const node = this.data.nodes[this.currentNodeId];
        const container = document.getElementById('tagsContainer');
        
        // Vider complètement le container
        container.innerHTML = '';
        
        // Ajouter les tags existants
        if (node.tags && node.tags.length > 0) {
          node.tags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag';
            tagEl.style.cursor = 'pointer';
            tagEl.title = 'Cliquer pour rechercher ce tag';
            
            // Utiliser textContent pour éviter l'injection HTML
            const tagText = document.createElement('span');
            tagText.textContent = `🏷️ ${tag}`;
            tagText.onclick = (e) => {
              e.stopPropagation();
              this.openSearch(tag);
            };
            
            const removeBtn = document.createElement('span');
            removeBtn.className = 'tag-remove';
            removeBtn.textContent = '✕';
            removeBtn.onclick = (e) => {
              e.stopPropagation();
              this.removeTag(tag);
            };
            
            tagEl.appendChild(tagText);
            tagEl.appendChild(removeBtn);
            container.appendChild(tagEl);
          });
        }
        
        // Recréer le wrapper avec l'input ET l'autocomplete
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tag-input';
        input.id = 'tagInput';
        input.placeholder = '+ tag';
        input.onkeydown = (e) => this.handleTagInput(e);
        input.oninput = (e) => this.handleTagAutocomplete(e);
        input.onfocus = () => this.showTagAutocomplete();
        input.onblur = () => this.hideTagAutocomplete();
        
        const autocompleteDiv = document.createElement('div');
        autocompleteDiv.className = 'tag-autocomplete';
        autocompleteDiv.id = 'tagAutocomplete';
        autocompleteDiv.style.display = 'none';
        
        wrapper.appendChild(input);
        wrapper.appendChild(autocompleteDiv);
        container.appendChild(wrapper);
      },

      // Toggle entre mode édition et affichage markdown
      toggleViewMode() {
        this.viewMode = this.viewMode === 'edit' ? 'view' : 'edit';
        localStorage.setItem('deepmemo_viewMode', this.viewMode);
        this.updateViewMode();
      },

      // Mettre à jour l'affichage selon le mode
      updateViewMode() {
        const toggleBtn = document.getElementById('toggleViewMode');
        const contentEditor = document.getElementById('nodeContent');
        const contentPreview = document.getElementById('contentPreview');

        if (this.viewMode === 'view') {
          // Mode affichage : afficher le rendu markdown
          toggleBtn.textContent = '✏️ Éditer';
          contentEditor.style.display = 'none';
          contentPreview.style.display = 'block';

          if (this.currentNodeId) {
            const node = this.data.nodes[this.currentNodeId];
            if (node && node.content) {
              const renderedContent = marked.parse(node.content);
              contentPreview.innerHTML = '<div class="markdown-content">' + renderedContent + '</div>';
            } else {
              contentPreview.innerHTML = '<div class="markdown-content"><em>Aucun contenu</em></div>';
            }
          }
        } else {
          // Mode édition : afficher le textarea
          toggleBtn.textContent = '👁️ Afficher';
          contentEditor.style.display = 'block';
          contentPreview.style.display = 'none';
          // Adapter la taille du textarea au contenu
          this.autoResizeTextarea(contentEditor);
        }
      }
    };

    window.addEventListener('DOMContentLoaded', () => app.init());
