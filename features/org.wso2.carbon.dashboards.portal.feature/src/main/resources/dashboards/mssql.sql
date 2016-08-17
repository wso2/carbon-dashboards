--
-- Copyright 2016 WSO2 Inc. (http://wso2.org)
--
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
--     http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.
--
IF NOT  EXISTS (SELECT * FROM SYS.OBJECTS WHERE OBJECT_ID = OBJECT_ID(N'[DBO].[GADGET_USAGE]') AND TYPE IN (N'U'))
CREATE TABLE IF NOT EXISTS GADGET_USAGE (
    TENANT_ID INT NOT NULL,
    DASHBOARD_ID VARCHAR(255) NOT NULL,
    GADGET_ID VARCHAR(255) NOT NULL,
    GADGET_STATE BOOLEAN,
    USAGE_DATA TEXT,
    PRIMARY KEY(DASHBOARD_ID, GADGET_ID)
);