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

CREATE TABLE GADGET_USAGE (
    TENANT_ID INTEGER NOT NULL,
    DASHBOARD_ID LVARCHAR(255) NOT NULL,
    GADGET_ID LVARCHAR(255) NOT NULL,
    GADGET_STATE LVARCHAR(255) NOT NULL,
    USAGE_DATA LVARCHAR(30000),
    PRIMARY KEY(TENANT_ID, DASHBOARD_ID, GADGET_ID)
);
CREATE INDEX G_INDEX ON GADGET_USAGE(TENANT_ID, GADGET_ID);

CREATE TABLE NOTIFICATION (
  NOTIFICATION_ID VARCHAR(255) NOT NULL,
  TITLE VARCHAR (255 ),
  MESSAGE VARCHAR (255),
  DIRECT_URL VARCHAR (255),
  PRIMARY KEY (NOTIFICATION_ID)
);


CREATE TABLE USER_NOTIFICATION (
  NOTIFICATION_ID VARCHAR(255) NOT NULL,
  USER_ID VARCHAR (255) NOT NULL,
  SEEN BOOLEAN NOT NULL,
  PRIMARY KEY(NOTIFICATION_ID, USER_ID),
  FOREIGN KEY(NOTIFICATION_ID)
       REFERENCES NOTIFICATION(NOTIFICATION_ID),
);

CREATE TABLE ROLE_NOTIFICATION (
  NOTIFICATION_ID VARCHAR(255) NOT NULL,
  ROLE VARCHAR (255) NOT NULL,
  PRIMARY KEY(NOTIFICATION_ID, ROLE),
  FOREIGN KEY(NOTIFICATION_ID)
    REFERENCES NOTIFICATION(NOTIFICATION_ID)),
);
