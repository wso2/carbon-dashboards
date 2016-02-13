var log = new Log();

var carbon = require('carbon');
var utils = require('/modules/utils.js');

/**
 * get registry reference
 */
var getRegistry = function () {
    var server = new carbon.server.Server();
    return new carbon.registry.Registry(server, {
        system: true
    });
};

//TODO: what happen when the context is changed or mapped via reverse proxy
var registryPath = function (id) {
    var path = '/_system/config/ues/dashboards';
    return id ? path + '/' + id : path;
};

var registryUserPath = function (id, username) {
    var path = '/_system/config/ues/' + username + '/dashboards';
    return id ? path + '/' + id : path;
};

var findOne = function (id) {
    var registry = getRegistry();
    var usr = require('/modules/user.js');
    var user = usr.current();
    var path = registryPath(id);
    var originalDB;
    var isCustom = false;
    if (user) {
        var userDBPath = registryUserPath(id, user.username);
        var originalDBPath = registryPath(id);

        if(registry.exists(originalDBPath)){
            originalDB = JSON.parse(registry.content(originalDBPath));
        }

        if (registry.exists(userDBPath)) {
            path = userDBPath;
            isCustom = true;
        }
    }
    var content = registry.content(path);
    var dashboard = JSON.parse(content);
    if (dashboard) {
        dashboard.isUserCustom = isCustom;
        dashboard.isEditorEnable = false;

        if(originalDB){
            var carbon = require('carbon');
            var server = new carbon.server.Server();
            var um = new carbon.user.UserManager(server, user.tenantId);
            user.roles = um.getRoleListOfUser(user.username);

            for(var i = 0; i<user.roles.length; i++){
                for(var j=0; j<originalDB.permissions.editors.length; j++){
                    if(user.roles[i] == originalDB.permissions.editors[j]){
                        dashboard.isEditorEnable = true;
                        break;
                    }
                }
            }
        }

        var banner = getBanner(id, (user ? user.username : null));
        dashboard.banner = {
            globalBannerExists: banner.globalBannerExists,
            customBannerExists: banner.customBannerExists
        };
    }
    return dashboard;
};

var find = function (paging) {
    var registry = getRegistry();
    var dashboards = registry.content(registryPath(), paging);
    var dashboardz = [];
    dashboards.forEach(function (dashboard) {
        dashboardz.push(JSON.parse(registry.content(dashboard)));
    });
    return dashboardz;
};

var create = function (dashboard) {
    var server = new carbon.server.Server();
    var registry = getRegistry();
    var userManager = new carbon.user.UserManager(server);
    var path = registryPath(dashboard.id);
    if (registry.exists(path)) {
        throw 'a dashboard exists with the same id ' + dashboard.id;
    }
    registry.put(path, {
        content: JSON.stringify(dashboard),
        mediaType: 'application/json'
    });
    userManager.denyRole('internal/everyone', path, 'read');
};

var update = function (dashboard) {

    var registry = getRegistry();

    var usr = require('/modules/user.js');
    var user = usr.current();
    if (!user) {
        throw 'User is not logged in ';
    }

    var path = registryUserPath(dashboard.id, user.username);
    if (!registry.exists(path) && !dashboard.isUserCustom) {
        path = registryPath(dashboard.id);
        if (!registry.exists(path)) {
            throw 'a dashboard cannot be found with the id ' + dashboard.id;
        }
    }
    registry.put(path, {
        content: JSON.stringify(dashboard),
        mediaType: 'application/json'
    });
};

var copy = function (dashboard) {
    var registry = getRegistry();
    var usr = require('/modules/user.js');
    var user = usr.current();
    if (!user) {
        throw 'User is not logged in ';
    }
    var path = registryUserPath(dashboard.id, user.username);
    if (!registry.exists(path)) {
        registry.put(path, {
            content: JSON.stringify(dashboard),
            mediaType: 'application/json'
        });
    }

};

var reset = function (id) {
    var registry = getRegistry();
    var usr = require('/modules/user.js');
    var user = usr.current();
    if (!user) {
        throw 'User is not logged in ';
    }
    var path = registryUserPath(id, user.username);
    if (registry.exists(path)) {
        registry.remove(path);
    }

    deleteBanner(id, user.username);
};

var remove = function (id) {
    var registry = getRegistry();
    var path = registryPath(id);
    if (registry.exists(path)) {
        registry.remove(path);
    }
};

var allowed = function (dashboard, permission) {
    var usr = require('/modules/user.js');
    var user = usr.current();
    var permissions = dashboard.permissions;
    if (permission.edit) {
        return utils.allowed(user.roles, permissions.editors);
    }
    if (permission.view) {
        return utils.allowed(user.roles, permissions.viewers);
    }
};

/**
 * Save banner in the registry
 * @param {String} dashboardId   ID of the dashboard
 * @param {String} username      Username
 * @param {String} filename      Name of the file
 * @param {String} mime mime     Type of the file
 * @param {Object} stream        Bytestream of the file
 */
var saveBanner = function (dashboardId, username, filename, mime, stream) {
    var uuid = require('uuid');
    var registry = getRegistry();

    var path = registryBannerPath(dashboardId, username);
    var resource = {
        content: stream,
        uuid: uuid.generate(),
        mediaType: mime,
        name: filename,
        properties: {}
    };

    registry.put(path, resource);
};

/**
 * Delete dashboard banner (if the username is empty, then the default banner will be removed,
 * otherwise the custom banner for the user will be removed)
 * @param {String} dashboardId   ID of the dashboard
 * @param {String} username      Username
 */
var deleteBanner = function (dashboardId, username) {
    getRegistry().remove(registryBannerPath(dashboardId, username));
};

/**
 * Render banner
 * @param {String} dashboardId ID of the dashboard
 * @param {String} username    Username
 */
var renderBanner = function (dashboardId, username) {
    var registry = getRegistry();
    var FILE_NOT_FOUND_ERROR = 'requested file cannot be found';

    var banner = getBanner(dashboardId, username);
    if (!banner) {
        response.sendError(404, FILE_NOT_FOUND_ERROR);
        return;
    }

    var r = registry.get(banner.path);
    if (r == null || r.content == null) {
        response.sendError(404, FILE_NOT_FOUND_ERROR);
        return;
    }

    response.contentType = r.mediaType;
    print(r.content);
    return;
};

/**
 * Path to customizations directory in registry
 * @returns {String}
 */
var registryCustomizationsPath = function () {
    return '/_system/config/ues/customizations';
};

/**
 * Get saved registry path for a banner
 * @param   {String} dashboardId ID of the dashboard
 * @param   {String} username    Current user's username
 * @returns {String}
 */
var registryBannerPath = function (dashboardId, username) {
    return registryCustomizationsPath() + '/' + dashboardId + (username ? '/' + username : '')
        + '/banner';
};

/**
 * Get banner details (banner type and the registry path)
 * @param   {String} dashboardId ID of the dashboard
 * @param   {String} username    Username
 * @returns {Object}
 */
var getBanner = function (dashboardId, username) {
    var registry = getRegistry();
    var path;
    var result = { globalBannerExists: false, customBannerExists: false, path: null };

    // check to see whether the custom banner exists
    path = registryBannerPath(dashboardId, username);
    if (registry.exists(path)) {
        
        var resource = registry.get(path);
        if (!resource.content || new String(resource.content).length == 0) {
            return result;
        }
        
        result.customBannerExists = true;
        result.path = path;
    }

    // check to see if there is any global banner
    path = registryBannerPath(dashboardId, null);
    if (registry.exists(path)) {

        result.globalBannerExists = true;
        result.path = result.path || path;
    }

    return result;
};

/**
 * Generate Bootstrap layout from Gridster JSON serialized layout
 * @param   {String} pageId     ID of the dashboard page
 * @param   {String} isAnon     Is anon mode
 * @returns {String}            Bootstrap layout markup
 */
var getBootstrapLayout = function(pageId, isAnon) {
    var bitmap, 
        err = [], 
        content = '', 
        unitHeight = 115;
    
    /**
     * Process the data object and build the grid
     */    
    function initGrid(data) {

        var grid = [];

        data.forEach(function(d) {

            // if there is no second dimension array, create it
            if (typeof grid[d.row - 1] === 'undefined') 
                grid[d.row - 1] = [];
            
            grid[d.row - 1][d.col - 1] = { "id": d.id, "width": d.size_x, "height": d.size_y, "banner": d.banner || false };
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
    function printRow(grid, y, sx, ex, parentWidth) {

        parentWidth = parentWidth || 12;

        var x, width, el, classes, row, left,
            offset = 0,
            previousEndPoint = 0, 
            processedRow = [], 
            content = '',
            height = 0;
        
        // calculate new indices and widths depending on the parent's width
        for(x = sx; x <= ex; x++) {
            var el = grid[y][x];
            if (typeof el === 'undefined') continue;

            left = Math.ceil((x - sx) * 12) / (12 - sx);
            width = Math.ceil((el.width * 12) / parentWidth);

            processedRow[left] = { id: el.id, height: el.height, width: width, left: left, banner: el.banner };
        }

        // draw the bootstrap columns
        for(x = 0; x <= 11; x++) {
            if (typeof processedRow[x] === 'undefined') continue;
            
            height = unitHeight * processedRow[x].height;
            classes = 'col-md-' + processedRow[x].width + ' ues-component-box';
            
            if (processedRow[x].banner) {
                classes += ' ues-banner-placeholder';
            }
            
            var styles;
            if (!processedRow[x].banner) {
                styles = 'min-height: ' + height + 'px;';
            }
            
            offset = x - previousEndPoint;
            if (offset > 0) 
                classes += ' col-md-offset-' + offset;   

            previousEndPoint += processedRow[x].width + offset;

            content += '<div id="' + processedRow[x].id + '" class="' + classes +'" '; 
            if (styles) {
                content += 'style="' + styles + '" ';
            }
            content += 'data-height="' + processedRow[x].height + '"></div>';
        }

        return '<div class="row">' + content + '</div>';
    }

    /**
     * Process the grid and generate the Bootstrap template
     */
    function process(grid, sx, sy, ex, ey, parentWidth) {

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

        var x, previousHeight, 
            varyingHeight = false, 
            y = sy, 
            rowSpan = 1,
            startRow = sy, 
            endRow = -1;

        var content = '';

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
            if (rowSpan == 0 || y == ey) {

                endRow = y;

                // if the heights of each block is not varying, then the section can be 
                // printed as a single row. otherwise the row block needc to be processed.
                if (!varyingHeight) {

                    content += printRow(grid, startRow, sx, ex, parentWidth);

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

                    var startCol, endCol, child, width, row, child = '';

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

                            var subContent = '';

                            if (startCol == sx && endCol == ex) {
                                err.push({
                                    name: 'UnsupportedLayoutError',
                                    message: 'Unable to properly render the layout using Bootstrap'
                                });
                                
                                // fallback to the failsafe mode
                                
                                var refinedGrid = [], i = 0, x2, y2;
                                
                                // read the non-renderable section from the grid and create a renderable grid with refined indices
                                for(y2 = startRow; y2 <= endRow; y2++) {
                                    if (typeof grid[y2] === 'undefined') continue;
                                    for(x2 = sx; x2 <= ex; x2++) {
                                        var el = grid[y2][x2];
                                        if (typeof el === 'undefined') continue;
                                          
                                        refinedGrid[i] = [el];
                                        i += el.height;
                                    }
                                }
                                
                                // print each row from the non-renderable grid
                                for(y2 = 0; y2 < refinedGrid.length; y2++) {
                                    if (typeof refinedGrid[y2] === 'undefined') continue;
                                    for(x2 = 0; x2 <= 11; x2++) {
                                        if (typeof refinedGrid[y2][x2] === 'undefined') continue;
                                        
                                        subContent += printRow(refinedGrid, y2, 0, 11, 12);
                                    }
                                }
                                
                            } else {
                                subContent += process(grid, startCol, startRow, endCol, endRow, width);   
                            }

                            child += '<div class="col-md-' + width + '">' + subContent + '</div>';
                            startCol = endCol + 1;
                        }                            
                    }

                    content += '<div class="row">' + child + '</div>';
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

        return content;
    };
    
    var page, result = '';
    dashboard.pages.forEach(function(p) {
        if (p.id == pageId) {
            page = p;
            return;
        }
    });
    
    if (!page) {
        response.sendError(404, 'not found');
        return;
    }
    
    try {
        var json = (isAnon ? page.layout.content.anon.blocks : page.layout.content.loggedIn.blocks);
        content = '<div class="' + (page.layout.fluidLayout ? 'container-fluid' : 'container') + '">' + process(initGrid(json)) + '</div>';
    } catch(e) {
        err.push(e);
    }
    
    if (err.length > 0) {      
        var errMessage = '';
        err.forEach(function(e) {
            errMessage += e.message + '\n';
        });
        log.error('errors: ' + errMessage);
    }

    return content;
}


