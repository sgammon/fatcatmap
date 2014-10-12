/**
 * @fileoverview Map view.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('$');
goog.require('View');
goog.require('views.Detail');
goog.require('views.detail.Legislator');
goog.require('models.graph');
goog.require('services.graph');

goog.provide('views.Map');

var PI, _distributeNodeInsertion;

PI = Math.PI;

/**
 * Given a bounding size, origin, radius & number of nodes, calculates graceful insertion positions.
 * @param {Array.<number>} size Width & height of the viewable area.
 * @param {Array.<number>} origin X and Y coordinates of the origin.
 * @param {number} radius Radius of the enclosing circle, in pixels.
 * @param {Array.<models.graph.GraphNode>} nodes Nodes to calculate.
 * @param {boolean} full If true, calculates circle rather than arc.
 */
_distributeNodeInsertion = function (size, origin, radius, nodes, full) {
  var midX = size[0] / 2,
    midY = size[1] / 2,
    cx = origin[0],
    cy = origin[1],
    theta = 0,
    offset = (full !== true ? PI / 2 : 2 * PI) / (nodes.length - 1),
    node,
    i;

  if (cx < midX) {
    theta = cy < midY ? PI : PI / 2;
  } else if (cy < midY) {
    theta = 1.5 * PI;
  }

  for (i = 0; i < nodes.length; i++) {
    node = nodes[i];

    node.x = Math.round(cx + radius * Math.cos(theta));
    node.y = Math.round(cy + radius * Math.sin(theta));

    theta += offset;
  }
};

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.Map = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'page.map',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true,

  /**
   * @expose
   * @type {Object.<string, string>}
   */
  selectors: {
    /**
     * @expose
     * @type {string}
     */
    map: '#map',

    /**
     * @expose
     * @type {string}
     */
    edge: '.edge',

    /**
     * @expose
     * @type {string}
     */
    node: '.node',

    /**
     * @expose
     * @type {string}
     */
    selected: '.selected'
  },

  /**
   * @expose
   * @type {Object}
   */
  data: /** @lends {views.Map.prototype} */{
    /**
     * @expose
     * @type {Object}
     */
    map: {
      /**
       * @expose
       * @type {Array.<string>}
       */
      selected: [],

      /**
       * @expose
       * @type {boolean}
       */
      changed: false
    },

    /**
     * @expose
     * @type {Object}
     */
    config: {
      /**
       * @expose
       * @type {number}
       */
      width: 0,

      /**
       * @expose
       * @type {number}
       */
      height: 0,

      /**
       * @expose
       * @type {Object}
       */
      force: {
        /**
         * @expose
         * @type {number}
         */
        alpha: 0.15,

        /**
         * @expose
         * @type {number}
         */
        strength: 1,

        /**
         * @expose
         * @type {number}
         */
        friction: 0.4,

        /**
         * @expose
         * @type {number}
         */
        theta: 0.7,

        /**
         * @expose
         * @type {number}
         */
        gravity: 0.08,

        /**
         * @expose
         * @type {number}
         */
        charge: -3000,

        /**
         * @expose
         * @type {number}
         */
        chargeDistance: 620,

        /**
         * @expose
         * @type {number}
         */
        distance: 100
      },

      /**
       * @expose
       * @type {Object}
       */
      origin: {
        /**
         * @expose
         * @type {boolean}
         */
        snap: false,

        /**
         * @expose
         * @type {boolean}
         */
        dynamic: false,

        /**
         * @expose
         * @type {?Object.<{x: number, y: number}>}
         */
        position: null
      },

      /**
       * @expose
       * @type {Object}
       */
      node: {
        /**
         * @expose
         * @type {number}
         */
        radius: 25,

        /**
         * @expose
         * @type {number}
         */
        scaleFactor: 1.6,

        /**
         * @expose
         * @type {Array.<string>}
         */
        classes: ['node']
      },

      /**
       * @expose
       * @type {Object}
        */
      labels: {
        /**
         * @expose
         * @type {boolean}
         */
        enable: false,

        /**
         * @expose
         * @type {number}
         */
        distance: 0
      },

      /**
       * @expose
       * @type {Object}
       */
      edge: {
        /**
         * @expose
         * @type {number}
         */
        width: 2,

        /**
         * @expose
         * @type {string}
         */
        stroke: '#999',

        /**
         * @expose
         * @type {Array.<string>}
         */
        classes: ['link']
      },

      /**
       * @expose
       * @type {Object}
       */
      sprite: {
        /**
         * @expose
         * @type {number}
         */
        width: 60,

        /**
         * @expose
         * @type {number}
         */
        height: 60
      }
    },

    /**
     * @expose
     * @type {Object}
     */
    clicked: {
      /**
       * @expose
       * @type {string}
       */
      key: '',

      /**
       * @expose
       * @type {number}
       */
      timestamp: Date.now()
    },

    /**
     * @expose
     * @type {boolean}
     */
    dragging: false,

    /**
     * @expose
     * @type {boolean}
     */
    active: false
  },

  /**
   * @expose
   * @type {Object}
   */
  methods: /** @lends {views.Map.prototype} */{
    /**
     * @expose
     * @param {EventTarget} element
     * @return {boolean}
     */
    isNode: function (element) {
      return element.classList.contains('node');
    },

    /**
     * @expose
     * @param {EventTarget} element
     * @return {boolean}
     */
    isEdge: function (element) {
      return element.classList.contains('link');
    },

    /**
     * @expose
     * @param {MouseEvent} e
     * @this {views.Map}
     */
    viewDetail: function (e) {
      var target, key, selected, selectedI;

      if (!this.dragging) {
        target = e.target;

        if (this.isNode(target)) {
          e.preventDefault();
          e.stopPropagation();

          key = target.getAttribute('id').split('-').pop();
          selected = this.$.detail.keys();

          if (this.clicked.key === key && Date.now() - this.clicked.timestamp < 400)
            return this.browseTo(key);

          this.clicked.key = key;
          this.clicked.timestamp = Date.now();

          if (target.classList.contains(this.$options.selectors.selected.slice(1))) {
            selectedI = selected.indexOf(key);
            
            if (selectedI > -1)
              selected.splice(selectedI, 1);
          } else {
            if (e.shiftKey) {
              if (selected.length < 2)
                selected.push(key);
            } else {
              selected = [key];
            }
          }

          this.map.selected = selected;
          this.map.changed = true;

          this.$root.$emit('route', '/detail/' +
            (selected.length > 1 ? selected.join('/and/') : selected[0] || ''));
        }
      }
    },

    /**
     * @expose
     * @param {string} key
     * @this {views.Map}
     */
    browseTo: function (key) {
      var map = this;

      services.graph.construct(key, {
        depth: 1,
        keys_only: true
      }).then(function (graph, error) {
        var node, newPeers;

        if (graph) {
          node = graph.nodes.get(key);
          newPeers = node.peers().filter(function (n) {
            return n.edges.length === 1;
          });

          _distributeNodeInsertion(
            [map.config.width, map.config.height],
            [node.x, node.y],
            map.config.force.distance / 2,
            newPeers);

          map.draw(graph);
        }
      });
    },

    /**
     * @expose
     * @param {MouseEvent} e
     * @this {views.Map}
     */
    startDrag: function (e) {
      this.dragging = true;
    },

    /**
     * @expose
     * @param {MouseEvent} e
     * @this {views.Map}
     */
    endDrag: function (e) {
      this.dragging = false;
    },

    /**
     * @expose
     * @param {Graph=} graph
     * @this {views.Map}
     */
    draw: function (graph) {
      var view = this,
        selectors, root, node, origin, edge, tick, force, update;

      if (graph && !view.map.root) {
        selectors = view.$options.selectors;

        root = d3
          .select(selectors.map)
          .attr('width', config.width)
          .attr('height', config.height);

        node = root.selectAll(selectors.node);
        edge = root.selectAll(selectors.edge);

        tick = function () {
          var config = view.config,
            radius = config.node.radius;

          // Start force first to ensure nodes have x/y values.
          view.map.force.start();

          if (graph.origin) {
            // Sync origin position, handling snap if enabled.
            if (config.origin.snap) {
              graph.nodes.get(graph.origin.index).x = config.origin.position.x;
              graph.nodes.get(graph.origin.index).y = config.origin.position.y;
            } else {
              view.config.origin.position = {
                x: graph.nodes.get(graph.origin.index).x,
                y: graph.nodes.get(graph.origin.index).y
              };
            }
          }

          // Set edge & node positions for this tick.
          edge.attr('x1', function (e) { return e.source.x - radius; })
              .attr('y1', function (e) { return e.source.y - radius; })
              .attr('x2', function (e) { return e.target.x - radius; })
              .attr('y2', function (e) { return e.target.y - radius; });

          node.attr('cx', function (n) { return n.x - radius; })
              .attr('cy', function (n) { return n.y - radius; });

          if (view.map.changed) {
            // Apply transitions & update classes if node selection is changed.
            node.filter(selectors.selected)
                .filter(function (n) { return view.map.selected.indexOf(n.key) === -1; })
                .classed({'selected': false})
                .transition()
                .duration(150)
                .ease('cubic')
                .attr('r', config.node.radius);

            node.filter(function (n) { return view.map.selected.indexOf(n.key) > -1; })
                .classed({'selected': true})
                .transition()
                .duration(150)
                .ease('cubic')
                .attr('r', config.node.radius * config.node.scaleFactor);

            view.map.changed = false;
          }
        };

        force = d3.layout
          .force()
          .size([config.width, config.height])
          .linkDistance(config.force.distance)
          .linkStrength(config.force.strength)
          .friction(config.force.friction)
          .theta(config.force.theta)
          .gravity(config.force.gravity)
          .alpha(config.force.alpha)
          .chargeDistance(config.force.chargeDistance)
          .charge(function (n) {
            if (view.map.selected.indexOf(n.key) > -1)
              return config.force.charge * Math.pow(config.node.scaleFactor, 2);

            return config.force.charge;
          })
          .on('tick', tick);

        update = function () {
          var config = view.config,
            nodes = graph.nodes.filter(function (n) { return n.edges.length; }),
            edges = graph.edges;

          force
            .nodes(nodes)
            .links(edges)
            .start();

          edge = edge.data(edges, edges.key);

          edge.exit().remove();

          edge.enter()
              .insert('line', '.node')
              .attr('id', function (e) { return 'edge-' + e.key; })
              .attr('x1', function (e) { return e.source.x; })
              .attr('y1', function (e) { return e.source.y; })
              .attr('x2', function (e) { return e.target.x; })
              .attr('y2', function (e) { return e.target.y; })
              .attr('stroke-width', config.edge.width)
              .attr('stroke', config.edge.stroke)
              .attr('class', config.edge.classes);

          node = node.data(nodes, edges.key);

          node.exit().remove();

          node.enter()
              .append('svg:circle')
              .attr('id', function (n) { return 'node-' + n.key; })
              .attr('cx', function (n) { return n.x; })
              .attr('cy', function (n) { return n.y; })
              .attr('r', config.node.radius)
              .attr('width', config.sprite.width)
              .attr('height', config.sprite.height)
              .attr('class', function (n, i) {
                if (view.map.selected.indexOf(n.key) > -1)
                  view.map.changed = true;

                return n.classes.join(' ');
              })
              .call(force.drag);

          origin = node.filter(function (n, i) {
            return n.key.equals(graph.origin.key);
          });

          if (view.map.changed)
            force.start();
        };

        view.map.root = root;
        view.map.force = force;

        this.$root.nextTick(function () {
          update();
        });
      } else {
        view.map.root = null;
        $(view.$options.selectors.map).innerHTML = '';
        return view.draw(graph);
      }
    },

    /**
     * @expose
     * @param {UIEvent} e
     */
    resize: function (e) {
      var width = $('#catnip').clientWidth,
      height = $('#catnip').clientHeight;

      this.config.width = width;
      this.config.height = height;

      if (this.map.root)
        this.map.root
          .attr('width', width)
          .attr('height', height);

      if (this.config.origin.snap) {
        this.config.origin.position = {
          x: width / 2,
          y: height / 2
        };
      }

      this.map.force
        .size([width, height])
        .resume();
    }
  },

  /**
   * @expose
   * @this {views.Map}
   */
  ready: function () {
    var mapSelector = this.$options.selectors.map;

    this.$watch('active', function (active) {
      if (active)
        $(mapSelector).classList.remove('transparent');
    });

    this.resize = this.resize.bind(this);

    window.addEventListener('resize', this.resize);
  },

  /**
   * @expose
   * @this {views.Map}
   */
  beforeDestroy: function () {
    window.removeEventListener('resize', this.resize);
  },

  /**
   * @expose
   * @param {Graph=} graph
   * @this {views.Map}
   */
  handler: function (graph) {
    var config = this.config,
      width = $('#catnip').clientWidth,
      height = $('#catnip').clientHeight,
      midX = width / 2,
      midY = height / 2,
      origin,
      newNodes;

    config.width = width;
    config.height = height;

    if (config.origin.snap) {
      config.origin.position = config.origin.position || {};
      config.origin.position = {
        x: midX,
        y: midY
      };
    }

    if (graph) {
      this.active = true;

      origin = graph.nodes.get(graph.origin.index);

      origin.x = midX;
      origin.y = midY;

      newNodes = graph.nodes.filter(function (node) {
        return !(node.x && node.y)
      });

      _distributeNodeInsertion(
        [width, height],
        [midX / 2, midY / 2],
        midY / 2,
        newNodes,
        true);

      this.draw(graph);
    } else if (this.active) {
      this.map.changed = true;

      if (this.map.force)
        this.map.force.start();
    }
  }
});
