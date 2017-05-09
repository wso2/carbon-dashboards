/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var getConfig, validate, getMode, getSchema, getData, registerCallBackforPush;

(function () {

    var PROVIDERS_LOCATION = '/extensions/providers/';
    var STRING = "string";
    var NUMBER = "number";

    /**
     * require the existing config.json and push any dynamic fields that needs to be populated in the UI
     */

    var typeMap = {
        "bool" : STRING,
        "boolean" : STRING,
        "varchar" : STRING,
        "character" : STRING,
        "binary" : STRING,
        "text" : STRING,
        "string" : STRING,
        "date" :  STRING,
        "time" :  STRING,
        "decimal" : NUMBER,
        "smallint" : NUMBER,
        "bigint" : NUMBER,
        "numeric" : NUMBER,
        "real" : NUMBER,
        "int" : NUMBER,
        "integer" : NUMBER,
        "long" : NUMBER,
        "double" : NUMBER,
        "float" : NUMBER,
        "timestamp" : NUMBER,
        "varchar2" : STRING,
        "number" : NUMBER,
        "datetime" : STRING,
        "character varying" : STRING,
        "bigserial" : NUMBER,
        "nvarchar2" : STRING,
        "datetime2" : STRING,
        "nvarchar" : STRING,
        "ntext" : STRING
    };


    getConfig = function () {
        var formConfig = require(PROVIDERS_LOCATION + '/rdbms/config.json');
        return formConfig;
    };

    /**
     * validate the user input of provider configuration
     * @param providerConfig
     */
    validate = function (providerConfig) {
        var db = null;
        try {
            db = new Database(providerConfig['dbUrl'], providerConfig['userName'], providerConfig['password'],
             {driverClassName : providerConfig['driverClassName']});
        } catch (e) {
            return {
                "error" : true,
                "message" : "Error Connecting to Database"
            }
        } finally {
            if (db != null) {
                db.close();
            }
        }
        return true;
    };

    /**
     * returns the data mode either push or pull
     */
    getMode = function () {
        return 'pull';
    };

    /**
     * returns an array of column names & types
     * @param providerConfig
     */
    getSchema = function (providerConfig) {
        var db = null;
        try {
            var databaseUrl = providerConfig['dbUrl'];
            var databaseName = databaseUrl.substring(databaseUrl.lastIndexOf("/") + 1);
            var tableName = providerConfig['tableName'];
            var db_query = '';
            var COLUMN_NAME = 'column_name';
            var COLUMN_TYPE = 'column_type';
            var databases = getConfig().databases;
            for (var i in databases) {
                if (databaseUrl.toLowerCase().indexOf(databases[i].databaseType) > 0) {
                    db_query = databases[i].queries.getSchema + tableName;
                    if (databases[i].queries.appendTableSchema) {
                        db_query += databases[i].queries.appendTableSchema + databaseName;
                    }
                    if(databases[i].queries.statementEnd) {
                        db_query += databases[i].queries.statementEnd;
                    }
                    COLUMN_NAME = databases[i].ColumnName;
                    COLUMN_TYPE = databases[i].ColumnType;
                }
            }
            db = new Database(providerConfig['dbUrl'], providerConfig['userName'], providerConfig['password'],
                              {driverClassName : providerConfig['driverClassName']});
            var schema = db.query(db_query);
            var selectQuerySchema = getSelectQueryFields(providerConfig);
            if (schema.length != 0) {
                for (var i in schema) {
                    schema[i].fieldName = schema[i][COLUMN_NAME];
                    var indexOfFieldInSelect = selectQuerySchema.indexOf(schema[i][COLUMN_NAME]);
                    if ( indexOfFieldInSelect > -1){
                        selectQuerySchema.splice(indexOfFieldInSelect, 1);
                    }
                    var dbColType = schema[i][COLUMN_TYPE].toLowerCase();
                    var fieldType = dbColType;
                    if (dbColType.indexOf('(') > -1) {
                        fieldType = dbColType.substring(0, dbColType.indexOf('('));
                    }
                    schema[i].fieldType = typeMap[fieldType];
                    delete schema[i][COLUMN_NAME];
                    delete schema[i][COLUMN_TYPE];
                }
                if (selectQuerySchema.length != 0) {
                    for (var i in selectQuerySchema) {
                        schema.push({
                            fieldName: selectQuerySchema[i],
                            fieldType: STRING
                        });
                    }
                }
                return schema;
            }
        } catch (e) {
            return {
                "error": true,
                "message": e.message
            }
        } finally {
            if (db != null) {
                db.close();
            }
        }
    };

    var getSelectQueryFields = function (providerConfig) {
        var schema = [];
        var selectQueryResult = getData(providerConfig, 1);
        if (selectQueryResult[0]){
            for (var key in selectQueryResult[0]){
                schema.push(key);
            }
        }
        return schema;
    };

    /**
     * returns the actual data
     * @param providerConfig
     * @param limit
     */
    getData = function (providerConfig, limit) {
        var data;
        var db = null;
        var databaseUrl = providerConfig['dbUrl'];
        try {
            db = new Database(providerConfig['dbUrl'], providerConfig['userName'], providerConfig['password'],
                              {driverClassName : providerConfig['driverClassName']});
            var query = providerConfig['query'];
            if (limit) {
                query = query.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                var databases = getConfig().databases;
                for (var i in databases) {
                    if (databaseUrl.toLowerCase().indexOf(databases[i].databaseType) > 0) {
                        var limitQuery = databases[i].queries.limit;
                        query += limitQuery || "";
                        var topQuery = databases[i].queries.top;
                        if (topQuery) {
                            var indexOfSelect = query.toLowerCase().indexOf("select");
                            query = query.slice(0, indexOfSelect + 6) + topQuery + query.slice(indexOfSelect + 6);
                            
                        }
                        query = query.replace(/\?/g, limit);
                    }
                }
            }
            data = db.query(query);
        }
        finally {
            if (db != null) {
                db.close();
            }
        }
        return data;

    };
}());
