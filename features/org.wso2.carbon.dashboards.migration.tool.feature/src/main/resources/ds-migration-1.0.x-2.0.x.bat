@echo off
for /F "tokens=3 delims=><" %%a in ('findstr /c:"<Mode>"  migration.xml') do set Mode=%%a

IF  %Mode% == CAR for /F "tokens=3 delims=><" %%a in ('findstr /c:"<SourceDir>"  migration.xml') do set SourceDir=%%a
IF  %Mode% == CAR IF ["%SourceDir%"] == [] echo Source Directory cannot be empty
IF  %Mode% == CAR IF ["%SourceDir%"] == ["/SourceDir"] echo Source Directory cannot be empty
IF  %Mode% == CAR for /F "tokens=3 delims=><" %%a in ('findstr /c:"<DestinationDir>"  migration.xml') do set DestinationDir=%%a
echo %DestinationDir%
IF  %Mode% == CAR IF ["%DestinationDir%"] == [] echo Destination Directory cannot be empty
IF  %Mode% == CAR IF ["%DestinationDir%"] == ["/DestinationDir"] echo Destination Directory cannot be empty

IF  %Mode% == CAR java -cp "%script%..\..\..\repository\components\plugins\*" org.wso2.carbon.dashboards.migrationtool.DSCarFileMigrationTool "%SourceDir%" "%DestinationDir%"
IF  %Mode% == CAR goto :eof

IF  %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<SourceDir>"  migration.xml') do set SourceDir=%%a
IF  %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<DestinationDir>"  migration.xml') do set DestinationDir=%%a
IF %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<TrustStoreLocation>"  migration.xml') do set TrustStoreLocation=%%a
IF %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<TrustStorePassword>"  migration.xml') do set TrustStorePassword=%%a
IF %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<SourceURL>"  migration.xml') do set SourceURL=%%a
IF %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<SourceUsername>"  migration.xml') do set SourceUsername=%%a
IF %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<SourcePassword>"  migration.xml') do set SourcePassword=%%a
IF %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<DestinationURL>"  migration.xml') do set DestinationURL=%%a
IF %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<DestinationUsername>"  migration.xml') do set DestinationUsername=%%a
IF %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<DestinationPassword>"  migration.xml') do set DestinationPassword=%%a
IF %Mode% == Portal for /F "tokens=3 delims=><" %%a in ('findstr /c:"<TenantDomains>"  migration.xml') do set TenantDomains=%%a

IF %Mode% == Portal IF ["%SourceDir%"] == [] set "SourceDir=notDefined"

IF %Mode% == Portal IF ["%SourceDir%"] == ["/SourceDir"] set "SourceDir=notDefined"

IF %Mode% == Portal IF ["%DestinationDir%"] == [] set "DestinationDir=notDefined"

IF %Mode% == Portal IF ["%DestinationDir%"] == ["/DestinationDir"] set "DestinationDir=notDefined"

IF %Mode% == Portal IF ["%TrustStoreLocation%"] == [] set "TrustStoreLocation=notDefined"

IF %Mode% == Portal IF ["%TrustStoreLocation%"] == ["/TrustStoreLocation"] set "TrustStoreLocation=notDefined"

IF %Mode% == Portal IF ["%TrustStorePassword%"] == [] set "TrustStorePassword=notDefined"

IF %Mode% == Portal IF ["%TrustStorePassword%"] == ["/TrustStorePassword"] set "TrustStorePassword=notDefined"

IF %Mode% == Portal IF ["%SourceURL%"] == [] set "SourceURL=notDefined"

IF %Mode% == Portal IF ["%SourceURL%"] == ["/SourceURL"] set "SourceURL=notDefined"

IF %Mode% == Portal IF ["%SourceUsername%"] == [] set "SourceUsername=notDefined"

IF %Mode% == Portal IF ["%SourceUsername%"] == ["/SourceUsername"] set "SourceUsername=notDefined"

IF %Mode% == Portal IF ["%SourcePassword%"] == [] set "SourcePassword=notDefined"

IF %Mode% == Portal IF ["%SourcePassword%"] == ["/SourcePassword"] set "SourcePassword=notDefined"

IF %Mode% == Portal IF ["%DestinationURL%"] == [] set "DestinationURL=notDefined"

IF %Mode% == Portal IF ["%DestinationURL%"] == ["/DestinationURL"] set "DestinationURL=notDefined"

IF %Mode% == Portal IF ["%DestinationUsername%"] == [] set "DestinationUsername=notDefined"

IF %Mode% == Portal IF ["%DestinationUsername%"] == ["/DestinationUsername"] set "DestinationUsername=notDefined"

IF %Mode% == Portal IF ["%DestinationPassword%"] == [] set "DestinationPassword=notDefined"

IF %Mode% == Portal IF ["%DestinationPassword%"] == ["/DestinationPassword"] set "DestinationPassword=notDefined"

IF %Mode% == Portal IF ["%TenantDomains%"] == [] set "TenantDomains=notDefined"

IF %Mode% == Portal IF ["%TenantDomains%"] == ["/TenantDomains"] set "TenantDomains=notDefined"

IF %Mode% == Portal java -cp %SourceDir%\repository\components\plugins\* org.wso2.carbon.dashboards.migrationtool.DSPortalAppMigrationTool "%SourceDir%" "%DestinationDir%" "%SourceURL%" "%SourceUsername%" "%SourcePassword%" "%DestinationURL%" "%DestinationUsername%" "%DestinationPassword%" "%TenantDomains%" "%TrustStoreLocation%" "%TrustStorePassword%"

IF %Mode% == Portal goto :eof