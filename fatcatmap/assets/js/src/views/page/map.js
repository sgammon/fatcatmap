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
goog.require('async');
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
    map: {},

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
        charge: -600,

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
    }
  },

  /**
   * @expose
   * @type {Object}
   */
  methods: /** @lends {views.Map.prototype} */{
    /**
     * @expose
     * @param {Node} element
     * @return {boolean}
     */
    isNode: function (element) {
      return element.classList.contains('node');
    },

    /**
     * @expose
     * @param {Node} element
     * @return {boolean}
     */
    isEdge: function (element) {
      return element.classList.contains('link');
    },

    /**
     * @expose
     * @param {MouseEvent} e
     * @throws {}
     * @this {views.Map}
     */
    select: function (e) {
      var target = e.target,
        key = target.id.split('-').pop(),
        className = this.$options.selectors.selected.slice(1),
        selectedI;

      if (!this.map.selected) {
        this.map.selected = [];
      }

      if (this.isNode(target)) {
        e.preventDefault();
        e.stopPropagation();

        if (target.classList.contains(className)) {
          selectedI = this.map.selected.indexOf(key);

          if (selectedI > -1)
            this.map.selected.splice(selectedI, 1);
        } else {
          if (!e.shiftKey)
            this.map.selected = [];

          this.map.selected.push(key);
        }
      }

      this.map.selected.changed = true;
      this.map.force.start();
    },

    /**
     * @expose
     * @param {MouseEvent} e
     */
    browseTo: /** @this {views.Map} */ function (e) {
      console.log('map.browseTo()');
    },

    /**
     * @expose
     * @param {Object=} graph
     * @this {views.Map}
     */
    draw: function (graph) {
      var view = this,
        config, selectors, root, node, origin, edge, tick, force, update;

      if (graph && !view.map.root) {
        config = view.config;
        selectors = view.$options.selectors;

        root = d3
          .select(selectors.map)
          .attr('width', config.width)
          .attr('height', config.height);

        node = root.selectAll(selectors.node);
        edge = root.selectAll(selectors.edge);

        tick = function () {
          if (view.config.origin.snap) {
            graph.nodes[graph.origin].x = view.config.origin.position.x;
            graph.nodes[graph.origin].y = view.config.origin.position.y;
          }

          edge.attr('x1', function (e) { return e.source.x; })
              .attr('y1', function (e) { return e.source.y; })
              .attr('x2', function (e) { return e.target.x; })
              .attr('y2', function (e) { return e.target.y; });

          node.attr('cx', function (n) { return n.x; })
              .attr('cy', function (n) { return n.y; });

          if (view.map.selected && view.map.selected.changed) {
            node.filter(selectors.selected)
                .filter(function (n) {
                  return view.map.selected.indexOf(n.key) === -1;
                })
                .classed({'selected': false})
                .transition()
                .duration(200)
                .ease('cubic')
                .attr('r', config.node.radius);

            node.filter(function (n) {
                  return view.map.selected.indexOf(n.key) > -1;
                })
                .classed({'selected': true})
                .transition()
                .duration(200)
                .ease('cubic')
                .attr('r', config.node.radius * config.node.scaleFactor);

            view.map.selected.changed = false;
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
          .charge(function (n) {
            if (view.map.selected && view.map.selected.indexOf(n.key) > -1) {
              return config.force.charge * config.node.scaleFactor;
            }
            return config.force.charge;
          })
          .on('tick', tick);

        update = function () {
          var nodes = graph.nodes,
            edges = graph.edges;

          force
            .nodes(nodes)
            .links(edges)
            .start();

          edge = edge.data(edges, function (e) { return e.key; });

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

          node = node.data(nodes, function (n) { return n.key; });

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
                return n.classes.join(' ');
              })
              .call(force.drag);

          origin = node.filter(function (n, i) {
            return n.key === graph.origin_key;
          });
        };

        view.map.root = root;
        view.map.force = force;

        setTimeout(function () {
          update();
        }, 0);
      } else {
        view.map.root = null;
        $(view.$options.selectors.map).innerHTML = '';
        return view.draw(graph);
      }
    }
  },

  /**
   * @expose
   * @this {views.Map}
   */
  ready: function () {
    var view = this;

    window.addEventListener('resize', function (e) {
      var width = view.$el.clientWidth,
        height = view.$el.clientHeight;

      view.config.width = width;
      view.config.height = height;

      if (view.map.root)
        view.map.root
          .attr('width', width)
          .attr('height', height);

      if (view.config.origin.snap) {
        view.config.origin.position.x = width / 2;
        view.config.origin.position.y = height / 2;
      }

      if (view.map.force)
        view.map.force
          .size([width, height])
          .resume();
    });
  },

  /**
   * @expose
   * @param {object} graph
   * @this {views.Map}
   */
  handler: function (graph) {
    var width = this.$el.clientWidth,
      height = this.$el.clientHeight;

    this.config.width = width;
    this.config.height = height;

    if (this.config.origin.snap) {
      this.config.origin.position = this.config.origin.position || {};
      this.config.origin.position.x = width / 2;
      this.config.origin.position.y = height / 2;
    }

    this.draw(graph);

    $(this.$options.selectors.map).classList.remove('transparent');
  }
});
