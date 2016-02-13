(function () {

    var gadgetPrefix = (osapi.container.GadgetHolder.IFRAME_ID_PREFIX_ = 'sandbox-');

    var containerPrefix = 'gadget-';

    var gadgets = {};

    var server = ues.global.server;

    var resolveURI = ues.dashboards.resolveURI;

    var context = ues.global.context;

    var resolveGadgetURL = function (uri) {
        uri = resolveURI(uri);
        if (uri.match(/^https?:\/\//i)) {
            return uri;
        }
        uri = uri.replace(/^(..\/)*/i, '');
        if (window.location.protocol === 'https:') {
            return 'https://' + window.location.hostname + ":" + server.httpsPort + context + '/' + uri;
        }
        return 'http://' + window.location.hostname + ":" + server.httpPort + context + '/' + uri;
    };

    var subscribeForClient = ues.hub.subscribeForClient;

    var containerId = function (id) {
        return containerPrefix + id;
    };

    var gadgetId = function (id) {
        return gadgetPrefix + containerPrefix + id;
    };

    ues.hub.subscribeForClient = function (container, topic, conSubId) {
        var clientId = container.getClientID();
        var data = gadgets[clientId];
        if (!data) {
            return subscribeForClient.apply(ues.hub, [container, topic, conSubId]);
        }
        var component = data.component;
        var channel = component.id + '.' + topic;
        console.log('subscribing container:%s topic:%s, channel:%s by %s', clientId, topic, channel);
        return subscribeForClient.apply(ues.hub, [container, channel, conSubId]);
    };

    var component = (ues.plugins.components['gadget'] = {});
    
    var hasCustomUserPrefView = function (metadata, comp) {
        if(metadata.views.hasOwnProperty('settings')){
            comp.hasCustomUserPrefView= true;
        }
    };

    var hasCustomFullView = function (metadata, comp) {
        if(metadata.views.hasOwnProperty('full')){
            comp.hasCustomFullView= true;
        }
    };

    var loadLocalizedTitle = function (styles, comp) {
        var userLang = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage || navigator.browserLanguage);
        var locale_titles = comp.content.locale_titles || {};
        styles.title = locale_titles[userLang] || comp.content.title;
        comp.content.locale_titles = locale_titles || {};
    };

    component.create = function (sandbox, comp, hub, done) {
        var content = comp.content, 
            url = resolveGadgetURL(content.data.url), 
            settings = content.settings || {}, 
            styles = content.styles || {}, 
            options = content.options || (content.options = {});
        ues.gadgets.preload(url, function (err, metadata) {
            var pref, 
                name, 
                option, 
                params = {}, 
                prefs = metadata.userPrefs;
            
            for (pref in prefs) {
                if (prefs.hasOwnProperty(pref)) {
                    pref = prefs[pref];
                    name = pref.name;
                    option = options[name] || {};
                    options[name] = {
                        type: option.type || pref.dataType,
                        title: option.title || pref.displayName,
                        value: option.value || pref.defaultValue,
                        options: option.options || pref.orderedEnumValues,
                        required: option.required || pref.required
                    };
                    params[name] = option.value;
                }
            }
            
            loadLocalizedTitle(styles, comp);
            var cid = containerId(comp.id), 
                gid = gadgetId(comp.id);
            
            sandbox.find('.ues-component-title').text(styles.title);
            
            if (styles.borders) {
                sandbox.removeClass('ues-borderless');
            } else {
                sandbox.addClass('ues-borderless');
            }
            
            var titlePositon = 'ues-component-title-' + (styles.titlePosition || 'left');
            
            sandbox.find('.ues-component-header')
                .removeClass('ues-component-title-left ues-component-title-center ues-component-title-right')
                .addClass(titlePositon);

            if (ues.global.dbType === 'default') {
                hasCustomUserPrefView(metadata, comp);
                hasCustomFullView(metadata, comp);
            }
            
            var container = $('<div />').attr('id', cid);
            sandbox.find('.ues-component-body').html(container);
            
            var renderParams = {};    
            renderParams[osapi.container.RenderParam.HEIGHT] = sandbox.closest('.ues-component-box').height() - 66;
            renderParams[osapi.container.RenderParam.VIEW] = comp.viewOption || 'home';
            
            var site = ues.gadgets.render(container, url, params, renderParams);
            gadgets[gid] = {
                component: comp,
                site: site
            };
            done(false, comp);
        });
    };

    component.update = function (sandbox, comp, hub, done) {
        component.destroy(sandbox, comp, hub, function (err) {
            if (err) {
                throw err;
            }
            component.create(sandbox, comp, hub, done);
        });
    };

    component.destroy = function (sandbox, comp, hub, done) {
        var gid = gadgetId(comp.id);
        var data = gadgets[gid];
        var site = data.site;
        ues.gadgets.remove(site.getId());
        $('.ues-component-box-gadget', sandbox).remove();
        done(false);
    };

}());