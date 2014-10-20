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
goog.require('views.component.Detail');
goog.require('views.detail.Legislator');
goog.require('models.graph');
goog.require('services.graph');

goog.provide('views.page.Map');

var PI, _distributeNodeInsertion, _calculateLeafLinkAdjustment, ASSET_TYPES;

PI = Math.PI;

/**
 * Given a bounding size, origin, radius & number of nodes, calculates graceful insertion positions.
 * @param {Array.<number>} size Width & height of the viewable area.
 * @param {Array.<number>} origin X and Y coordinates of the origin.
 * @param {number} radius Radius of the enclosing circle, in pixels.
 * @param {Array.<models.graph.GraphNode>} nodes Nodes to calculate.
 * @param {boolean=} full If true, calculates nodes for full circle.
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
 * Given a bounding size, radius, & leaf and peer node, calculates (x, y) adjustment for leaf-side
 * link position to align exactly with the outer edge of the node. Prevents ugly link/node overlap
 * when alpha values are changed on nodes in the graph. Updates the edge object.
 * @param {number} radius Leaf radius, in pixels.
 * @param {models.graph.GraphNode} leaf Leaf node.
 * @param {models.graph.GraphNode} peer Node at other end of the adjusted link.
 * @return {Object.<{ x: number, y: number }>}
 */
_calculateLeafLinkAdjustment = function (radius, leaf, peer) {
  var theta = Math.atan((leaf.y - peer.y) / (leaf.x - peer.x)),
    diff = {
      x: radius * Math.cos(theta),
      y: radius * Math.sin(theta)
    };

  if (leaf.x > peer.x)
    diff.x = -diff.x;

  if (leaf.y > peer.y)
    diff.y = -diff.y;

  return diff;
};

ASSET_TYPES = ['gif', 'png', 'raw', 'jpeg', 'webp', 'tiff'];

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
      return element && element.classList.contains('node') ||
        element.parentNode.classList.contains('node-group');
    },

    /**
     * @expose
     * @param {EventTarget} element
     * @return {boolean}
     */
    isEdge: function (element) {
      return element && element.classList.contains('link');
    },

     /**
     * @expose
     * @param {MouseEvent} e
     * @this {views.Map}
     */
    trim: function (e) {
      var target = e.target,
        cached;

      if (target.classList.has('trim') || target.classList.has('untrim')) {
        e.preventDefault();
        e.stopPropagation();

        if (target.classList.has('trim')) {
          this.cached = this.graph.trim(true);
          this.$emit('page.map', this.graph);
        } else {
          this.$emit('page.map', this.cached || this.graph);
          this.cached = null;
        }
      }
    },


    /**
     * @expose
     * @param {string} key
     * @this {views.map}
     */
    prune: function (key) {
      this.cached = this.graph.prune(key);
      this.$emit('page.map', this.graph);
    },

    /**
     * @expose
     * @param {string} key
     * @param {MouseEvent} e
     * @this {views.Map}
     */
    viewDetail: function (key, e) {
      var target, selected, selectedI;

      if (key && e) {
        e.preventDefault();
        e.stopPropagation();

        target = e.target;
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
        keys_only: false,
        collections: true,
        descriptors: true
      }).then(function (graph, error) {
        var node, newPeers;

        if (graph) {
          node = graph.nodes.get(key);

          newPeers = node.peers().filter(function (n) {
            return n.isLeaf();
          });

          _distributeNodeInsertion(
            [map.config.width, map.config.height],
            [node.x, node.y],
            map.config.force.distance / 2,
            newPeers);

          graph.origin.key = node.key;
          graph.origin.index = graph.nodes.index[node.key];

          map.$set('config.origin.snap', true);
          map.$set('map.changed', true);

          map.$emit('page.map', graph);
        }
      });
    },

    /**
     * @expose
     * @param {Graph=} graph
     * @this {views.Map}
     */
    draw: function (graph) {
      var view = this,
        selectors, root, node, edge, shape, origin, tick, force, update;

      if (graph && !view.map.root) {
        selectors = view.$options.selectors;

        root = d3
          .select(selectors.map)
          .attr('width', view.config.width)
          .attr('height', view.config.height);

        node = root.selectAll('svg');
        edge = root.selectAll(selectors.edge);
        shape = node.selectAll('circle');

        tick = function () {
          var radius = view.config.node.radius,
            i = 0,
            origin;

          view.map.force.start();

          if (graph.origin) {
            origin = graph.nodes.get(graph.origin.index);

            if (view.config.origin.snap) {
              origin.x += (view.config.origin.position.x - origin.x) / 20;
              origin.y += (view.config.origin.position.y - origin.y) / 20;
            } else {
              view.config.origin.position = {
                x: origin.x,
                y: origin.y
              };
            }
          }

          edge.attr('x1', function (e) { return e.source.x - radius; })
              .attr('y1', function (e) { return e.source.y - radius; })
              .attr('x2', function (e) { return e.target.x - radius; })
              .attr('y2', function (e) { return e.target.y - radius; });

          node.attr('x', function (n) { return n.x - view.config.sprite.width; })
              .attr('y', function (n) { return n.y - view.config.sprite.height; });

          if (view.map.changed) {
            shape.filter(selectors.selected)
                .filter(function (n) { return view.map.selected.indexOf(n.key) === -1; })
                .classed({'selected': false})
                .transition()
                .duration(150)
                .ease('cubic')
                .attr('r', radius);

            shape.filter(function (n) { return view.map.selected.indexOf(n.key) > -1; })
                .classed({'selected': true})
                .transition()
                .duration(150)
                .ease('cubic')
                .attr('r', radius * view.config.node.scaleFactor);

            view.map.changed = false;
          }
        };

        force = d3.layout
          .force()
          .size([view.config.width, view.config.height])
          .linkDistance(view.config.force.distance)
          .linkStrength(view.config.force.strength)
          .friction(view.config.force.friction)
          .theta(view.config.force.theta)
          .gravity(view.config.force.gravity)
          .alpha(view.config.force.alpha)
          .chargeDistance(view.config.force.chargeDistance)
          .charge(function (n) {
            if (view.map.selected.indexOf(n.key) > -1)
              return view.config.force.charge * Math.pow(view.config.node.scaleFactor, 2);

            return view.config.force.charge;
          })
          .on('tick', tick);

        update = function () {
          var nodes = graph.nodes.filter(function (n) { return n.edges.length; }),
            edges = graph.edges;

          force
            .nodes(nodes)
            .links(edges)
            .on('start', function () {
              setTimeout(function () { force.alpha(-1); }, 5000);
            })
            .start();

          node = node.data(nodes, nodes.key);

          node.exit().remove();

          node = node.enter()
              .append('svg:svg')
              .attr('id', function (n) { return 'node-' + n.key; })
              .attr('width', view.config.sprite.width)
              .attr('height', view.config.sprite.height)
              .attr('x', function (n) { return n.x - view.config.sprite.width; })
              .attr('y', function (n) { return n.y - view.config.sprite.height; })
              .attr('class', 'node-group')
              .on('click', /** @param {GraphNode} n */function (n) {
                if (!d3.event.defaultPrevented)
                  view.viewDetail(n.key.urlsafe(), d3.event);
              })
              .call(force.drag);

          shape = node
              .append('svg:circle')
              .attr('width', view.config.sprite.width)
              .attr('height', view.config.sprite.height)
              .attr('cx', function (n) { return view.config.sprite.width / 2; })
              .attr('cy', function (n) { return view.config.sprite.height / 2; })
              .attr('r', view.config.node.radius)
              .attr('class', function (n) {
                if (view.map.selected.indexOf(n.key) > -1)
                  view.map.changed = true;

                if (n.isLeaf()) {
                  n.classes.push('leaf');
                } else {
                  if (n.classes.has('leaf'))
                    n.classes.splice(n.classes.index['leaf'], 1);
                }

                return n.classes.join(' ');
              });

          node
              .filter(function (n) {
                var kind = n.kind.toLowerCase();
                return !!n.media || /legislative/.test(kind) || /committee/.test(kind);
              })
              .append('svg:image')
              .attr('width', view.config.sprite.width)
              .attr('height', view.config.sprite.height)
              // .attr('x', function (n) { return n.x; })
              // .attr('y', function (n) { return n.y; })
              .attr('clip-path', 'url(#node-circle-mask)')
              .attr('xlink:href', function (n) {
                var img;

                if (n.media) {
                  img = n.media['md'] || n.media['sm'];

                  return 'https://fatcatmap.org/image-proxy/providence-clarity/warehouse/' +
                    img['location'] + '.' + ASSET_TYPES[img['formats'][0]];
                }

                if (/legislative/.test(n.kind))
                  return '/assets/img/icons/legislative.png';

                return '/assets/img/icons/committee.png';
              });

          edge = edge.data(edges, edges.key);

          edge.exit().remove();

          edge.enter()
              .insert('line', 'svg')
              .attr('id', function (e) { return 'edge-' + e.key; })
              .attr('x1', function (e) { return e.source.x; })
              .attr('y1', function (e) { return e.source.y; })
              .attr('x2', function (e) { return e.target.x; })
              .attr('y2', function (e) { return e.target.y; })
              .attr('stroke-width', view.config.edge.width)
              .attr('stroke', view.config.edge.stroke)
              .attr('class', function (e) {
                if ((e.source.isLeaf() || e.target.isLeaf()) && !e.classes.has('leaf-link'))
                  e.classes.push('leaf-link');

                return e.classes.join(' ');
              });

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

      if (this.map.force)
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
    var map = this,
      mapSelector = map.$options.selectors.map;

    map.$watch('active', function (active) {
      if (active)
        $(mapSelector).classList.remove('transparent');
    });

    map.resize = map.resize.bind(map);

    window.addEventListener('resize', map.resize);
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
    var width = $('#catnip').clientWidth,
      height = $('#catnip').clientHeight,
      midX = width / 2,
      midY = height / 2,
      origin,
      newNodes;

    this.config.width = width;
    this.config.height = height;

    if (this.config.origin.snap) {
      this.config.origin.position = this.config.origin.position || {};
      this.config.origin.position = {
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
        return !(node.x && node.y);
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
