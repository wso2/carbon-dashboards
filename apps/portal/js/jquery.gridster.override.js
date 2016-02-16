(function() {
    /**
    * Set the current width of the parent grid.
    *
    * @method set_dom_grid_width
    * @return {Object} Returns the instance of the Gridster class.
    */
    Gridster.prototype.set_dom_grid_width = function(cols) {
        if (typeof cols === 'undefined') {
            cols = this.get_highest_occupied_cell().col;
        }

        var max_cols = (this.options.autogrow_cols ? this.options.max_cols :
            this.cols);

        cols = Math.min(max_cols, Math.max(cols, this.options.min_cols));
        this.container_width = cols * this.min_widget_width;
        return this;
    };


    /**
    * It generates the neccessary styles to position the widgets.
    *
    * @method generate_stylesheet
    * @param {Number} rows Number of columns.
    * @param {Number} cols Number of rows.
    * @return {Object} Returns the instance of the Gridster class.
    */
    Gridster.prototype.generate_stylesheet = function(opts) {
        var styles = '';
        var lgStyles = '';
        var max_size_x = this.options.max_size_x || this.cols;
        var max_rows = 0;
        var max_cols = 0;
        var i;
        var rules;

        opts || (opts = {});
        opts.cols || (opts.cols = this.cols);
        opts.rows || (opts.rows = this.rows);
        opts.namespace || (opts.namespace = this.options.namespace);
        opts.widget_base_dimensions ||
            (opts.widget_base_dimensions = this.options.widget_base_dimensions);
        opts.widget_margins ||
            (opts.widget_margins = this.options.widget_margins);
        opts.min_widget_width = (opts.widget_margins[0] * 2) +
            opts.widget_base_dimensions[0];
        opts.min_widget_height = (opts.widget_margins[1] * 2) +
            opts.widget_base_dimensions[1];

        // don't duplicate stylesheets for the same configuration
        var serialized_opts = $.param(opts);
        if ($.inArray(serialized_opts, Gridster.generated_stylesheets) >= 0) {
            return false;
        }

        this.generated_stylesheets.push(serialized_opts);
        Gridster.generated_stylesheets.push(serialized_opts);

        /* generate CSS styles for cols */
        for(i = 12; i >= 0; i--) {
            lgStyles += (opts.namespace + ' [data-col="'+ (i + 1) + '"] { left:' +
                'calc(' + (Math.round((i * 100 * 100000) / 12) / 100000) + '% + 15px); }\n');
        }

        /* generate CSS styles for rows */
        for (i = opts.rows; i >= 0; i--) {
            lgStyles += (opts.namespace + ' [data-row="' + (i + 1) + '"] { top:' +
                ((i * opts.widget_base_dimensions[1]) +
                (i * opts.widget_margins[1]) +
                ((i + 1) * opts.widget_margins[1]) ) + 'px; }\n');
        }

        for (var y = 1; y <= opts.rows; y++) {
            styles += (opts.namespace + ' [data-sizey="' + y + '"] { height:' +
                (y * opts.widget_base_dimensions[1] +
                (y - 1) * (opts.widget_margins[1] * 2)) + 'px; }\n');
        }

        for (var x = 1; x <= 12; x++) {
            lgStyles += (opts.namespace + ' [data-sizex="' + x + '"] { width:' +
                'calc(' + (Math.round((x * 100 * 100000) / 12) / 100000) + '% - 30px); }\n');
        }

        this.remove_style_tags();

        return this.add_style_tag(styles, lgStyles);
    };


    /**
    * Injects the given CSS as string to the head of the document.
    *
    * @method add_style_tag
    * @param {String} css The styles to apply.
    * @return {Object} Returns the instance of the Gridster class.
    */
    Gridster.prototype.add_style_tag = function(css, lgCss) {
        var d = document;
        var tag = d.createElement('style');

        // append media queries
        var styles = '@media screen and (min-width: 768px) {\n' +
            lgCss + '\n}\n' +
            css;

        d.getElementsByTagName('head')[0].appendChild(tag);
        tag.setAttribute('type', 'text/css');

        if (tag.styleSheet) {
            tag.styleSheet.cssText = styles;
        } else {
            tag.appendChild(document.createTextNode(styles));
        }

        this.$style_tags = this.$style_tags.add(tag);

        return this;
    };
})();