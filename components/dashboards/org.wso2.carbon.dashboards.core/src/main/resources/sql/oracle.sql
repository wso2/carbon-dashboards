DROP TABLE "DASHBOARD_RESOURCE";
--------------------------------------------------------
--  DDL for Table DASHBOARD_RESOURCE
--------------------------------------------------------

  CREATE TABLE "DASHBOARD_RESOURCE"
   (	"ID" NUMBER(*,0),
	"URL" VARCHAR2(100),
	"OWNER" VARCHAR2(100),
	"NAME" VARCHAR2(256),
	"DESCRIPTION" VARCHAR2(1000),
	"PARENT_ID" NUMBER,
	"LANDING_PAGE" VARCHAR2(100),
	"CONTENT" BLOB
   )
--------------------------------------------------------
--  DDL for Index DASHBOARD_RESOURCE_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "DASHBOARD_RESOURCE_PK" ON "DASHBOARD_RESOURCE" ("URL", "OWNER")
--------------------------------------------------------
--  DDL for Trigger DASHBOARD_RESOURCE_TRG
--------------------------------------------------------

  CREATE OR REPLACE TRIGGER "DASHBOARD_RESOURCE_TRG"
BEFORE INSERT ON DASHBOARD_RESOURCE
FOR EACH ROW
BEGIN
  SELECT DASHBOARD_RESOURCE_SEQ.NEXTVAL
  INTO   :new.ID
  FROM   dual;
END;
ALTER TRIGGER "DASHBOARD_RESOURCE_TRG" ENABLE
--------------------------------------------------------
--  Constraints for Table DASHBOARD_RESOURCE
--------------------------------------------------------

  ALTER TABLE "DASHBOARD_RESOURCE" ADD CONSTRAINT "DASHBOARD_RESOURCE_PK" PRIMARY KEY ("URL", "OWNER") ENABLE
  ALTER TABLE "DASHBOARD_RESOURCE" MODIFY ("PARENT_ID" NOT NULL ENABLE)
  ALTER TABLE "DASHBOARD_RESOURCE" MODIFY ("NAME" NOT NULL ENABLE)
  ALTER TABLE "DASHBOARD_RESOURCE" MODIFY ("OWNER" NOT NULL ENABLE)
  ALTER TABLE "DASHBOARD_RESOURCE" MODIFY ("URL" NOT NULL ENABLE)
  ALTER TABLE "DASHBOARD_RESOURCE" MODIFY ("ID" NOT NULL ENABLE)

DROP TABLE "WIDGET_RESOURCE";
--------------------------------------------------------
--  DDL for Table WIDGET_RESOURCE
--------------------------------------------------------

  CREATE TABLE "WIDGET_RESOURCE"
   (
    "WIDGET_ID" VARCHAR2(255),
	"WIDGET_NAME" VARCHAR2(255),
	"WIDGET_CONFIGS" BLOB
   )
--------------------------------------------------------
--  DDL for Index WIDGET_RESOURCE_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "WIDGET_RESOURCE_PK" ON "WIDGET_RESOURCE" ("WIDGET_ID", "WIDGET_NAME")
--------------------------------------------------------
--  Constraints for Table WIDGET_RESOURCE
--------------------------------------------------------

  ALTER TABLE "WIDGET_RESOURCE" ADD CONSTRAINT "WIDGET_RESOURCE_PK" PRIMARY KEY ("WIDGET_ID", "WIDGET_NAME") ENABLE
  ALTER TABLE "WIDGET_RESOURCE" MODIFY ("WIDGET_NAME" NOT NULL ENABLE)
  ALTER TABLE "WIDGET_RESOURCE" MODIFY ("WIDGET_ID" NOT NULL ENABLE)
