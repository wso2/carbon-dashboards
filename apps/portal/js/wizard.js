/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var provider;
var chartType;
var configGroup;
var wizardData = {};
var columns = [];
var step0Done = false;
var step1Done = false;
var step2Done = false;
var selectedTableCoulumns = [];
var defaultTableColumns = [];
var groups = "grouping";
var elements = "elements";
var fieldName = "fieldName";
var value = "value";

var PROVIDER_LOCATION = 'extensions/providers/';
var CHART_LOCATION = 'extensions/chart-templates/';
var WIZARD_LIB_LOCATION = '/wizard-libs/';

var PROVIDER_CONF = 'provider-conf';
var PROVIDER_NAME = 'provider-name';
var CHART_CONF = 'chart-conf';
var CHART_NAME = 'chart-name';
var PARTIAL = 'partial';

var CREATE_GADGET_API = 'apis/createGadget';

///////////////////////////////////////////// event handlers //////////////////////////////////////////

$('#rootwizard').bootstrapWizard({
    nextSelector: '.btn-next',
    previousSelector: '.btn-previous',
    onNext: function (tab, navigation, index) {
        var isRequiredFieldsFilled = true;

        $(tab.children('a').attr('href')).find('input[required="true"]').each(function () {
            if (!$.trim($(this).val())) {
                isRequiredFieldsFilled = false;
                showInlineError($(this), $("#" + $(this).attr("name") + "-error"));
            } else {
                hideInlineError($(this), $("#" + $(this).attr("name") + "-error"));
            }
        });

        if (index == 2) {
            if (isRequiredFieldsFilled) {
                if (editable) {
                    $('.btn-next a').text('Save Changes').removeClass('disabled');
                } else {
                    $('.btn-next a').text('Add to store').removeClass('disabled');
                }
                $('#lastTab').removeClass("tab-link-disabled");
            }
        }

        if (index == 3 && isRequiredFieldsFilled) {
            $('.btn-next').addClass('complete');
        }

        if (isRequiredFieldsFilled) {
            $($('.wiz-nav-inner li')[index]).removeClass('current').addClass('completed');
            $($('.wiz-nav-inner li')[index + 1]).addClass('current');
        }


        return isRequiredFieldsFilled;
    },
    onPrevious: function (tab, navigation, index) {
        if (index != -1) {
            $('.btn-next a').text('Next');
            tab.removeClass('current');
            tab.prev().removeClass('completed').addClass('current');
        }

    },
    onTabClick: function (tab, navigation, index) {
        return false;
    },
    onTabShow: function (tab, navigation, index) {
        if (index == 0 && !step0Done) {
            step0Done = true;
            getProviders();
            $("#btnPreview").hide();
            $('#rootwizard').find('.pager .next').addClass("disabled");
            $('#rootwizard').find('.pager .finish').hide();
        } else if (index == 1 && !step1Done) {
            step1Done = true;
            getProviderConfig();
        } else if (index == 2 && !step2Done) {
            step2Done = true
            wizardData = getProviderConfigData();
            getChartList();
            $('#chart-list').change();
        }
    }
});

$('#provider-list').change(function () {
    step1Done = false;
    provider = $("#providers").val();
});

/**
 * Handle event of clicking on the test configuration button
 */
$('#test-connection').click(function () {
    var providerConfig = getProviderConfigData();
    $.ajax({
        url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=testConnection',
        method: "POST",
        data: JSON.stringify(providerConfig),
        contentType: "application/json",
        async: false,
        success: function (data) {
            if (!data.error) {
                $('#tab2-validation-errors > .text').empty();
                $('#tab2-validation-errors').hide();
                $('#test-verification-label').show();
            } else {
                $('#tab2-validation-errors > .text').html(data.message);
                $('#tab2-validation-errors').show();
                $('#test-verification-label').hide();
            }
        },
        error: function (xhr, message, errorObj) {
            $('#tab2-validation-errors > .text').html('<strong>Error!</strong> in database configuration');
            $('#tab2-validation-errors').show();
            $('#test-verification-label').hide();
        }
    })
});

$('#show-data').click(function () {
    var pConfig = getProviderConfigData();
    $.ajax({
        url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=getData',
        method: "POST",
        data: JSON.stringify(pConfig),
        contentType: "application/json",
        async: false,
        success: function (data) {
            if (!data.error) {
                $('#sample-data-message').show();
                $('#tab2-validation-errors > .text').empty();
                $('#tab2-validation-errors').hide();
                var dataPreviewHbs = Handlebars.compile($('#data-preview-hbs').html());
                $('#data-preview').html(dataPreviewHbs(data));
                $('#rootwizard').find('.pager .next').removeClass("disabled");
            } else {
                $('#tab2-validation-errors > .text').html(data.message);
                $('#tab2-validation-errors').show();
                $('#rootwizard').find('.pager .next').addClass("disabled");
            }
        },
        error: function (xhr, message, errorObj) {
            //When 401 Unauthorized occurs user session has been log out
            if (xhr.status === 401) {
                //reload() will redirect request to login page with set current page to redirect back page
                location.reload();
            }
            var source = $("#wizard-error-hbs").html();
            var template = Handlebars.compile(source);
            $("#rootwizard").empty();
            $("#rootwizard").append(template({
                error: xhr.responseText
            }));
        }
    });
});

$('#chart-list').change(function () {
    chartType = $("#chart-type").val();
    wizardData['chartType'] = chartType;
    getChartConfig(wizardData);
});

$('#gadget-name').on('keyup', function () {
    if ($(this).val()) {
        hideInlineError($(this), $("#gadget-name-error"));
    }
});

$('#tab2').on('keypress', function () {
    $('#test-verification-label').hide();
    $('#tab2-validation-errors > .text').empty();
    $('#tab2-validation-errors').hide();
    $('input[required="true"]').each(function () {
        $(this).on('keyup', function (e) {
            if ($(this).val()) {
                hideInlineError($(this), $("#" + $(this).attr("name") + "-error"));
            }
        });
    });
});

$('#tab3').on('keypress', function () {
    $('#tab3-validation-errors > .text').empty();
    $('#tab3-validation-errors').hide();
});

$("#preview").click(function () {
    var wizard = $('#rootwizard');
    $("#generate").removeAttr("style");
    wizard.find('.pager .finish').show();
    wizard.find('.pager .finish').removeClass('disabled');
    delete wizardData['chartType'];
    wizardData[CHART_CONF] = getChartConfigData();

    if (!$.trim($("#gadget-name").val())) {
        showInlineError($("#gadget-name"), $("#gadget-name-error"), null);
    }
    else {
        $.ajax({
            url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=preview' + '&editable=' + editable + '&id=' + id,
            method: "POST",
            data: JSON.stringify(wizardData),
            contentType: "application/json",
            async: false,
            success: function (data) {
                if (!data.error) {
                    $('#tab3-validation-errors > .text').empty();
                    $('#tab3-validation-errors').hide();
                    var previewHbs = Handlebars.compile($('#preview-hbs').html());
                    $('#preview-pane').html(previewHbs(data));
                } else {
                    $('#tab3-validation-errors > .text').html(data.message);
                    $('#tab3-validation-errors').show();
                    $('#preview-pane').html('');
                    $('#rootwizard').find('.pager .finish').hide();
                }
            },
            error: function (xhr, message, errorObj) {
                //When 401 Unauthorized occurs user session has been log out
                if (xhr.status === 401) {
                    //reload() will redirect request to login page with set current page to redirect back page
                    location.reload();
                }
                var source = $("#wizard-error-hbs").html();
                var template = Handlebars.compile(source);
                wizard.empty();
                wizard.append(template({
                    error: xhr.responseText
                }));
            }
        });
    }
});

$(document).on('click', '.complete', function () {
    $("#preview").click();
    $.ajax({
        url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=addGadgetToStore' + '&editable=' + editable + '&id=' + id,
        method: "POST",
        data: JSON.stringify(wizardData),
        contentType: "application/json",
        async: false,
        success: function (data) {
            if (!data.error) {
                if (editable) {
                    var data = {};
                    data.message = manipulateEditGadgetInfo();
                    var editSuccessHbs = Handlebars.compile($('#edit-success-hbs').html());
                    $('#top-rootwizard').html(editSuccessHbs(data));
                } else {
                    $('#top-rootwizard').html($('#success-hbs').html());
                }
            } else {
                $('#tab3-validation-errors > .text').html(data.message);
                $('#tab3-validation-errors').show();
                $('#preview-pane').html('');
                $('#rootwizard').find('.pager .finish').hide();
            }
        },
        error: function (xhr, message, errorObj) {
            //When 401 Unauthorized occurs user session has been log out
            if (xhr.status === 401) {
                //reload() will redirect request to login page with set current page to redirect back page
                location.reload();
            }
            var source = $("#wizard-error-hbs").html();
            var template = Handlebars.compile(source);
            $("#rootwizard").empty();
            $("#rootwizard").append(template({
                error: xhr.responseText
            }));
        }
    });
})


////////////////////////////////////////////////////// end of event handlers ///////////////////////////////////////////////////////////

function manipulateEditGadgetInfo() {
    var gadgetConf = getGadgetConf();
    var message;
    if ($('#gadget-name').val() === gadgetConf['chart-conf']['gadget-name']) {
        message = "The  gadget " + $('#gadget-name').val() + " is successfully updated";
    } else {
        message = "A gadget with the name " + $('#gadget-name').val() + " is newly created ";
    }
    return message;
}

function getProviders() {
    if (editable) {
        var data = getGadgetConf();
        var providerHbs = Handlebars.compile($('#datasource-providers-hbs').html());
        $("#provider-list").html(providerHbs(data));
    } else {
        $.ajax({
            url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=getProviders',
            method: "GET",
            async: false,
            contentType: "application/json",
            success: function (data) {
                if (data.length === 0) {
                    var source = $("#wizard-zerods-hbs").html();
                    var template = Handlebars.compile(source);
                    $("#rootwizard").empty();
                    $("#rootwizard").append(template());
                    return;
                }
                var providerHbs = Handlebars.compile($('#datasource-providers-hbs').html());
                $("#provider-list").html(providerHbs(data));
            },
            error: function (xhr, message, errorObj) {
                //When 401 Unauthorized occurs user session has been log out
                if (xhr.status === 401) {
                    //reload() will redirect request to login page with set current page to redirect back page
                    location.reload();
                }
                var source = $("#wizard-error-hbs").html();
                var template = Handlebars.compile(source);
                $("#rootwizard").empty();
                $("#rootwizard").append(template({error: xhr.responseText}));
            }
        });
    }
};
/*
 * add value of the each elements of the generated gadgets
 * which have grouping in the provider's config.json
 * */

var populateValuesWithGrouping = function (group, values) {
    var groupArray = [];
    groupArray = Object.keys(group);
    for (var i = 0; i < groupArray.length; i++) {
        for (var j = 0; j < (group[i][elements]).length; j++) {
            group[i][elements][j][value] = values[group[i][elements][j][fieldName]];
        }
    }
    return group;
};
/*
 * add value of the each elements of the generated gadgets
 * which have no grouping in the provider's config.json
 * */
var populateValuesWithoutGrouping = function (group, values) {
    var groupArray = [];
    groupArray = Object.keys(group[groups][elements]);
    for (var i = 0; i < groupArray.length; i++) {
        group[groups][elements][i][value] = values[group[groups][elements][i][fieldName]];
    }
    return group;
};

function getProviderConfig() {
    step1Done = true;
    provider = $("#providers").val();
    var providerConf = {};
    var configInput = {};
    configInput[PROVIDER_NAME] = provider;
    providerConf[PROVIDER_CONF] = configInput;
    $.ajax({
        url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=getProviderConfig',
        method: "POST",
        data: JSON.stringify(providerConf),
        contentType: "application/json",
        async: false,
        success: function (data) {
            var providerHbs = Handlebars.compile($('#ui-config-hbs').html());
            if (Object.keys(data[0]).indexOf(groups) > -1) {
                configGroup = (data[0].grouping);
                for (var i = 0; i < configGroup.length; i++) {
                    registerAdvancedProviderUI(configGroup[i]);
                }
                if (editable) {
                    var gadgetConf = getGadgetConf();
                    var group = populateValuesWithGrouping(configGroup, gadgetConf['provider-conf']);
                    $("#provider-config").append(providerHbs(group));

                } else {
                    $("#provider-config").append(providerHbs(configGroup));
                }
            } else {
                configGroup = {
                    "grouping": {
                        "elements": data
                    }
                };
                if (editable) {
                    var gadgetConf = getGadgetConf();
                    var group = populateValuesWithoutGrouping(configGroup, gadgetConf['provider-conf']);
                    registerAdvancedProviderUI(configGroup);
                    $("#provider-config").html(providerHbs(group));
                }
                else {
                    registerAdvancedProviderUI(configGroup);
                    $("#provider-config").html(providerHbs(configGroup));
                }
            }
        },
        error: function (xhr, message, errorObj) {
            //When 401 Unauthorized occurs user session has been log out
            if (xhr.status === 401) {
                //reload() will redirect request to login page with set current page to redirect back page
                location.reload();
            }
            var source = $("#wizard-error-hbs").html();
            var template = Handlebars.compile(source);
            $("#rootwizard").empty();
            $("#rootwizard").append(template({
                error: xhr.responseText
            }));
        }
    });
};

function registerAdvancedProviderUI(data) {
    for (var i = 0; i < data.length; i++) {
        (function (config, key) {
            if (config[key]['fieldType'].toLowerCase() === 'advanced') {
                if (config[key]['wizard-imports']) {
                    var wizardCssList = config[key]['wizard-imports']["css"];
                    for (var i in wizardCssList) {
                        var link = document.createElement('link')
                        link.rel = 'stylesheet';
                        link.href = PROVIDER_LOCATION + provider + WIZARD_LIB_LOCATION + wizardCssList[i];
                        document.body.appendChild(link);
                    }
                    var wizardJsList = config[key]['wizard-imports']["js"];
                    for (var i in wizardJsList) {
                        var js = document.createElement('script');
                        js.src = PROVIDER_LOCATION + provider + WIZARD_LIB_LOCATION + wizardJsList[i];
                        document.body.appendChild(js);
                    }
                }
                var providerConf = {};
                var configInput = {};
                configInput[PROVIDER_NAME] = provider;
                configInput[PARTIAL] = config[key]['childPartial'];
                providerConf[PROVIDER_CONF] = configInput;
                $.ajax({
                    url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=getProviderAdvancedUI',
                    method: "POST",
                    data: JSON.stringify(providerConf),
                    contentType: "application/json",
                    dataType: 'text',
                    async: false,
                    success: function (partial) {
                        Handlebars.registerPartial(config[key]['childPartial'], partial);
                    }
                });
            }
        })(data, i);
    }
}

function getProviderConfigData() {
    var formData = $('#provider-config-form').serializeArray();
    var configInput = {};
    var providerConf = {};
    $.map(formData, function (n) {
        configInput[n['name']] = n['value'];
    });
    configInput[PROVIDER_NAME] = provider;
    providerConf[PROVIDER_CONF] = configInput;
    return providerConf;
}

function getGadgetConf() {
    var editableConf = {};
    var editConfData;
    $.ajax({
        url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=getEditConfig' + '&id=' + id,
        method: "POST",
        data: JSON.stringify(editableConf),
        contentType: "application/json",
        async: false,
        success: function (data) {
            editConfData = data;
        }
    });
    return editConfData;
}

function getChartList() {
    $.ajax({
        url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=getChartList',
        method: "GET",
        contentType: "application/json",
        async: false,
        success: function (chartList) {
            var chartListHbs = Handlebars.compile($('#chart-list-hbs').html());
            var gadgetNameHbs = Handlebars.compile($('#gadget-name-hbs').html());
            if (editable) {
                var gadgetConf = getGadgetConf();
                for (var i = 0; i < chartList.length; i++) {
                    if (chartList[i]['id'] === gadgetConf['chart-conf']['chart-name']) {
                        chartList[i]["selected"] = true;
                    }
                }
                $("#chart-list").html(chartListHbs(chartList));
                $("#gadgetName").html(gadgetNameHbs(gadgetConf['chart-conf']));
            } else {
                $("#chart-list").html(chartListHbs(chartList));
                $("#gadgetName").html(gadgetNameHbs(null));
            }
        }
    });
}

function getChartConfig(providerConfig) {
    $.ajax({
        url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=getChartConfig',
        method: "POST",
        data: JSON.stringify(providerConfig),
        contentType: "application/json",
        async: false,
        success: function (chartConfig) {
            if (!chartConfig.error) {
                var chartHbs = Handlebars.compile($('#ui-config-hbs').html());
                if (Object.keys(chartConfig[0]).indexOf(groups) > -1) {
                    configGroup = (chartConfig[0].grouping);
                    for (var i = 0; i < configGroup.length; i++) {
                        registerAdvancedProviderUI(configGroup[i]);
                    }
                    if (editable) {
                        var gadgetConf = getGadgetConf();
                        var group = populateValuesWithGrouping(configGroup, gadgetConf['chart-conf']);
                        $("#chart-config").append(chartHbs(group));
                        $("#preview").removeAttr("style");
                    }
                    else {
                        $("#chart-config").append(chartHbs(configGroup));
                        $("#preview").removeAttr("style");
                    }
                } else {
                    configGroup = {
                        "grouping": {
                            "elements": chartConfig
                        }
                    };
                    if (editable) {
                        var gadgetConf = getGadgetConf();
                        var group = populateValuesWithoutGrouping(configGroup, gadgetConf['chart-conf']);
                        registerAdvancedProviderUI(configGroup);
                        $("#chart-config").html(chartHbs(group));
                        $("#preview").removeAttr("style");
                    }
                    else {
                        registerAdvancedChartUI(configGroup);
                        $("#chart-config").html(chartHbs(configGroup));
                        $("#preview").removeAttr("style");
                    }
                }
            } else {
                $('#tab3-validation-errors > .text').html(chartConfig.message);
                $('#tab3-validation-errors').show();
                $('#rootwizard').find('.pager .next').addClass("disabled");
            }
        }
    });
}

function registerAdvancedChartUI(data) {
    for (var i = 0; i < data.length; i++) {
        (function (config, key) {
            if (config[key]['fieldType'].toLowerCase() === 'advanced') {
                if (config[key]['wizard-imports']) {
                    var wizardCssList = config[key]['wizard-imports']["css"];
                    for (var i in wizardCssList) {
                        var link = document.createElement('link')
                        link.rel = 'stylesheet';
                        link.href = CHART_LOCATION + chartType + WIZARD_LIB_LOCATION + wizardCssList[i];
                        document.body.appendChild(link);
                    }
                    var wizardJsList = config[key]['wizard-imports']["js"];
                    for (var i in wizardJsList) {
                        var js = document.createElement('script');
                        js.src = CHART_LOCATION + chartType + WIZARD_LIB_LOCATION + wizardJsList[i];
                        document.body.appendChild(js);
                    }
                }
                var data = {
                    "chartType": chartType,
                    "partial": config[key]['childPartial']
                };
                $.ajax({
                    url: ues.utils.relativePrefix() + CREATE_GADGET_API + '?action=getChartAdvancedUI',
                    method: "POST",
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    dataType: 'text',
                    async: false,
                    success: function (partial) {
                        Handlebars.registerPartial(config[key]['childPartial'], partial);
                    }
                });
            }
        })(data, i);
    }
}

function getChartConfigData() {
    var formData = $('#chart-config-form').serializeArray();
    var configInput = {};
    $.map(formData, function (n) {
        configInput[n['name']] = n['value'];
    });
    configInput[$('#gadget-name').attr("name")] = $('#gadget-name').val();
    configInput[CHART_NAME] = chartType;
    return configInput;
}
