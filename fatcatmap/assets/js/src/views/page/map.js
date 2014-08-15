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
goog.require('supports');
goog.require('View');
goog.require('views.Detail');

goog.provide('views.Map');

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
    node: '.node'
  },

  /**
   * @expose
   * @type {Object}
   */
  data: /** @lends {views.Map.prototype} */{
    /**
     * @expose
     * @type {boolean}
     */
    active: true,

    /**
     * @expose
     * @type {Object}
     */
    graph: {
      /**
       * @expose
       * @type {?Node}
       */
      root: null,

      /**
       * @expose
       * @type {?Object}
       */
      force: null,

      /**
       * @expose
       * @type {?Object}
       */
      edge: null,

      /**
       * @expose
       * @type {?Object}
       */
      line: null,

      /**
       * @expose
       * @type {?Object}
       */
      node: null,

      /**
       * @expose
       * @type {?Object}
       */
      circle: null
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
        alpha: 0.75,

        /**
         * @expose
         * @type {number}
         */
        strength: 1,

        /**
         * @expose
         * @type {number}
         */
        friction: 0.9,

        /**
         * @expose
         * @type {number}
         */
        theta: 0.7,

        /**
         * @expose
         * @type {number}
         */
        gravity: 0.1,

        /**
         * @expose
         * @type {number}
         */
        charge: -700,

        /**
         * @expose
         * @type {number}
         */
        distance: 180
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
        snap: true,

        /**
         * @expose
         * @type {boolean}
         */
        dynamic: true,

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
        radius: 20,

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
    }
  },

  /**
   * @expose
   * @type {Object}
   */
  methods: /** @lends {views.Map.prototype} */{
    /**
     * @expose
     * @param {MouseEvent} e
     */
    toggleSelected: /** @this {views.Map} */ function (e) {
      
    },

    /**
     * @expose
     * @param {MouseEvent} e
     */
    addSelected: /** @this {views.Map} */ function (e) {

    },

    /**
     * @expose
     * @param {MouseEvent} e
     */
    browseTo: /** @this {views.Map} */ function (e) {

    },

    /**
     * @expose
     * @param {Object=} graph
     * @this {views.Map}
     */
    draw: function (graph) {
      var config, selectors, color,
        force, root, edgeWrap, edge, line, nodeWrap, container, node, shape,
        lineTick, nodeTick;

      if (!this.graph.root) {
        config = this.config;
        selectors = this.$options.selectors;
        color = d3.scale.category20();

        force = this.graph.force = d3.layout.force()
                    .size(config.width, config.height)
                    .linkDistance(config.force.distance)
                    .charge(config.force.charge)
                    .linkStrength(config.force.strength)
                    .friction(config.force.friction)
                    .theta(config.force.theta)
                    .gravity(config.force.gravity)
                    .alpha(config.force.alpha);

        root = this.graph.root = d3.select(selectors.map);

        edgeWrap = root.selectAll(selectors.edge)
          .data(graph.edges)
          .enter();

        edge = this.graph.edge = edgeWrap.append('svg:svg')
          .attr('id', function (e) { return 'edge-' + e.edge.key; });

        line = this.graph.line = edge.append('svg:line')
          .attr('stroke', config.edge.stroke)
          .attr('class', config.edge.classes)
          .style('stroke-width', config.edge.width);

        nodeWrap = root.selectAll(selectors.node)
          .data(graph.nodes)
          .enter();

        container = nodeWrap.append('svg:svg')
          .attr('id', function (n) { return 'group-' + n.node.key; })
          .attr('width', config.sprite.width)
          .attr('height', config.sprite.height)
          .call(force.drag);

        node = this.graph.node = container.append('svg:g')
          .attr('width', config.sprite.width)
          .attr('height', config.sprite.height)
          .attr('class', function (d, i) {
            var classes = [];

            if (d.native.data.govtrack_id) {
              classes.push('legislator');
              classes.push(d.native.data.gender === 'M' ? 'male' : 'female');
              classes.push(Math.ceil(Math.random() * 100) % 2 ? 'democrat' : 'republican');
            } else {
              classes.push('contributor');
              classes.push(d.native.data.contributor_type == 'C' ? 'corporate' : 'individual');
            }

            return classes.join(' ');
          });

        shape = this.graph.circle = node.append('svg:circle')
          .attr('r', config.node.radius)
          .attr('cx', config.sprite.width / 2)
          .attr('cy', config.sprite.height / 2)
          .attr('class', config.node.classes);

        lineTick = function (direction, pt, edge_d, edge_i) {
          if (config.origin.snap) {
            if (edge_d[direction].index === graph.origin)
              return Math.floor(config.origin.position(pt));
          }
          return Math.floor(edge_d[direction][pt] + (config.node.radius / 2));
        };

        nodeTick = function(pt, node_d, node_i) {
          if (config.origin.snap) {
            if (node_i === graph.origin)
              return Math.floor(config.origin.position[pt] - (
                config.sprite[pt === 'x' ? 'width' : 'height'] / 2));
          }
          return Math.floor(node_d[pt] - config.node.radius);
        };

        force.on('tick', function (f) {
          var centerX, centerY;

          centerX = config.width / 2;
          centerY = config.height / 2;

          if (config.origin.dynamic && config.origin.snap) {
            this.config.origin.position = {
              x: centerX + (config.sprite.width / 2),
              y: centerY + (config.sprite.height / 2)
            };
          }

          ['x', 'y'].forEach(function (pt) {
            container.attr(pt, function (d, i) { nodeTick(pt, d, i); });
          });
          
          ['x1', 'y1', 'x2', 'y2'].forEach(function (pt) {
            line.attr(pt, function (d, i) {
              lineTick(pt[1] === '1' ? 'source' : 'target', pt[0], d, i);
            });
          });
        });

        force.nodes(graph.nodes).links(graph.edges).start();
      } else {
        this.graph.root = null;
        $(this.$options.selectors.map).innerHTML = '';
        this.draw(graph);
      }
    }
  },

  /**
   * @expose
   * @this {views.Map}
   */
  ready: function () {
    var view = this,
      width = this.$el.offsetWidth,
      height = this.$el.offsetHeight;

    this.config.width = width;
    this.config.height = height;
    this.config.origin.position = {
      x: width - 30,
      y: height - 30
    };

    window.addEventListener('resize', function (e) {
      var width = document.body.clientWidth,
        height = document.body.clientHeight;

      view.config.graph.width = width;
      view.config.graph.height = height;

      if (view.graph.root)
        view.graph.root
          .attr('width', width)
          .attr('height', height);

      if (view.graph.force)
        view.graph.force
          .size([width, height])
          .resume();
    });
  },

  /**
   * @expose
   * @this {views.Map}
   */
  handler: function (graph) {
    this.draw(graph);
  }
});
