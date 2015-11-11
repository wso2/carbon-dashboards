;(function(root) {

        var me = root.JSONToBootstrap = { };
        var bitmap, debugFn, errFn;

        /**
         * Process the data object and build the grid
         */    
        function initGrid(data) {

            var x, y, grid = [];

            data.forEach(function(d) {

                // if there is no second dimension array, create it
                if (typeof grid[d.top] === 'undefined') 
                    grid[d.top] = [];

                grid[d.top][d.left] = { "id": d.id, "width": d.width, "height": d.height };
            });

            return grid;
        };

        /**
         * Generate bitmap to mark starts and ends of the blocks
         */
        function generateBitmap(grid, sx, sy, ex, ey) {

            var x, y, i, extra = 0, localMax;
            bitmap = [];

            // calculate the total height of the bitmap
            for(y = sy; y <= ey; y++) {
                if (typeof grid[y] === 'undefined') continue;

                localMax = 0;
                for(x = sx; x <= ex; x++) {
                    if (typeof grid[y][x] === 'undefined') continue;

                    localMax = Math.max(localMax, grid[y][x].height);
                }

                extra = Math.max(--extra, 0) + localMax - 1;
            }

            // create a x * y bitmap and initialize into false state
            for(y = sy; y <= extra + ey; y++) {
                bitmap[y] = [];
                for(x = sx; x <= ex; x++) {
                    bitmap[y][x] = false;
                }
            }

            // traverse through the entire grid and mark cells appropriately
            for(y = sy; y <= ey; y++) {
                if (typeof grid[y] === 'undefined') continue;

                for(x = sx; x <= ex; x++) {
                    if (typeof grid[y][x] === 'undefined') continue;

                    // this is for multi-row blocks. iterate through all the rows and mark the 
                    // starts and offsets 
                    for(i = y; i < y + grid[y][x].height; i++) {

                        bitmap[i][x] = true;                    // start of the block
                        bitmap[i][x + grid[y][x].width] = true; // end of the block
                    }
                }
            }

            return bitmap;
        }

        /**
         * Prints a single bootstrap row
         */
        function printRow(grid, parent, y, sx, ex, parentWidth) {

            parentWidth = parentWidth || 12;

//            debug('printing row # ' + y + ' from ' + sx + ' to ' + ex);

            var x, width, el, classes, row, left,
                offset = 0,
                previousEndPoint = 0, 
                processedRow = [];

            // create a row div and append it to he parent
            row = $('<div />').addClass('row').appendTo(parent);

            // calculate new indices and widths depending on the parent's width
            for(x = sx; x <= ex; x++) {
                var el = grid[y][x];
                if (typeof el === 'undefined') continue;

                left = Math.ceil((x - sx) * 12) / (12 - sx);
                width = Math.ceil((el.width * 12) / parentWidth);

                processedRow[left] = { 'id': el.id, 'height': el.height, 'width': width, 'left': left };
            }

            // draw the bootstrap columns
            for(x = 0; x <= 11; x++) {
                if (typeof processedRow[x] === 'undefined') continue;

                classes = 'box-' + processedRow[x].height + ' col-md-' + processedRow[x].width + ' ues-component-box';

                offset = x - previousEndPoint;
                if (offset > 0) 
                    classes += ' col-md-offset-' + offset;   

                previousEndPoint += processedRow[x].width + offset;

                $('<div />')
                    .attr('id', processedRow[x].id)
                    .addClass(classes)
//                    .text(processedRow[x].id)
                    .appendTo(row);
            }

            return row;
        }

        /**
         * Process the grid and generate the Bootstrap template
         */
        function process(grid, parent, sx, sy, ex, ey, parentWidth) {

            // initialize optional parameters
            sx = sx || 0;
            ex = ex || 11;
            ey = ey || grid.length - 1;
            parentWidth = parentWidth || 12;

            // if the start row not defined, get the first defined row
            if (!sy) {
                for(y = 0; y <= ey; y++) {
                    if (typeof grid[y] === 'undefined') continue;

                    sy = y;
                    break;
                }   
            }           

//            debug('processing block (' + sx + ', ' + sy + ') to (' + ex + ', ' + ey + ')', true);

            var x, previousHeight, 
                varyingHeight = false, 
                y = sy, 
                rowSpan = 1,
                startRow = sy, 
                endRow = -1;

            bitmap = bitmap || generateBitmap(grid, sx, sy, ex, ey);

            // traverse through all the rows in the grid and process row-by-row
            while (y <= ey) {

                previousHeight = undefined;

                // calculate the row span (height of the row)
                for(x = sx; x <= ex; x++) {
                    if (typeof grid[y] === 'undefined' || typeof grid[y][x] === 'undefined') continue;

                    if (typeof previousHeight === 'undefined') { 
                        previousHeight = grid[y][x].height;
                    }

                    if (previousHeight != grid[y][x].height) {
                        varyingHeight = true;   
                    }

                    rowSpan = Math.max(rowSpan, grid[y][x].height);

                    previousHeight = grid[y][x].height;
                }

                // decrease the row span by 1 since the current row is being processed.
                rowSpan--;

                // if the rowSpan = 0, then we can safety split the above rows from the rest
                if (rowSpan == 0) {

                    endRow = y;

                    // if the heights of each block is not varying, then the section can be 
                    // printed as a single row. otherwise the row block need to be processed.
                    if (!varyingHeight) {

                        printRow(grid, parent, startRow, sx, ex, parentWidth);

                    } else {

                        // now we have a block of rows. so try to split it vertically if 
                        // possible. if not, this kind of layout cannot be rendered using 
                        // bootstrap.

                        // split vertically (by columns)

                        // identify the columns which have aligned margins
                        var columnStatus = [];
                        for(x = sx; x <= ex; x++) {
                            columnStatus[x] = true;

                            for(var i = startRow; i <= endRow; i++) {
                                columnStatus[x] = columnStatus[x] && bitmap[i][x];
                            }
                        }

                        var startCol, endCol, child, width, row;

                        // create a row div to wrap child containers
                        row = $('<div />').addClass('row').appendTo(parent);

                        // iterate through all the column, identify the start and end columns 
                        // and process the sub-grid recursively
                        
                        for(x = sx; x <= ex; x++) {

                            if (columnStatus[x] || x == ex) {

                                if (typeof startCol === 'undefined')  {
                                    startCol = (x == sx) ? x : x - 1;
                                    continue;   
                                }

                                endCol = (x == ex) ? x : x - 1; 
                                width = endCol - startCol + 1;

                                child = $('<div />').addClass('col-md-' + width).appendTo(row);

                                if (startCol == sx && endCol == ex) {
                                    throw {
                                        name: 'UnsupportedLayoutException',
                                        message: 'Unable to render the layout using Bootstrap'
                                    };
                                } else {
                                    process(grid, child, startCol, startRow, endCol, endRow, width);   
                                }

                                startCol = endCol + 1;
                            }                            
                        }
                    }

                    // skip the rows until a defined row is found
                    for(y = endRow + 1; y <= ey && typeof grid[y] === 'undefined'; y++);

                    rowSpan = 1;
                    startRow = y;

                    varyingHeight = false;

                } else {

                    // if this is not a row cut, skip to the next row
                    y++;

                }
            }
        };

        /**
         * Print debug messages
         */
        function debug(msg, block) {

            var separator = '---------------------------------------------------------------\n';
            var modifiedMsg = block ? '\n' + separator + msg + '\n' + separator : msg;

            if (debugFn) debugFn(modifiedMsg);
        }

        /**
         * Convert gridster JSON layout into 
         */
        me.convert = function(data, target, err, debug) {

            debugFn = debug;
            errFn = err;

            try {
                var grid = initGrid(data);
                process(grid, target);
            } catch (e) {
                if (errFn) {
                    errFn(e.message);
                }
            }
        }

//            me.test = function(data, debug) {
//                
//                debugFn = debug;
//                var grid = initGrid(data);,
//                
//            }

    })(this);