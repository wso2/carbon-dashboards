#!/bin/bash
cat migration.xml | sed '/<!--.*-->/d' | sed '/<!--/,/-->/d' > modified.xml
input='cat modified.xml'
Mode=($($input | grep -oP '(?<=Mode>)[^<]+'))
if [ "$Mode" = "CAR" ]; then
	SourceDir=($($input | grep -oP '(?<=SourceDir>)[^<]+'))
	if [ "$SourceDir" = "" ]; then
		echo "Source Directory cannot be empty"
		exit 1
	fi
	DestinationDir=($($input | grep -oP '(?<=DestinationDir>)[^<]+'))
	if [ "$DestinationDir" = "" ]; then
		echo "Destination Directory cannot be empty"
		exit 1
	fi
	SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
	java -cp :$SCRIPT_DIR/../../../repository/components/plugins/* org.wso2.carbon.dashboards.migrationtool.DSCarFileMigrationTool $SourceDir $DestinationDir
elif [ "$Mode" = "Portal" ]; then
	SourceDir=($($input | grep -oP '(?<=SourceDir>)[^<]+'))
	if [ "$SourceDir" = "" ]; then
		SourceDir="notDefined"
	fi
	DestinationDir=($($input | grep -oP '(?<=DestinationDir>)[^<]+'))
	if [ "$DestinationDir" = "" ]; then
		DestinationDir="notDefined"
	fi
	SourceURL=($($input | grep -oP '(?<=SourceURL>)[^<]+'))
	if [ "$SourceURL" = "" ]; then
		SourceURL="notDefined"
	fi
	DestinationURL=($($input | grep -oP '(?<=DestinationURL>)[^<]+'))
	if [ "$DestinationURL" = "" ]; then
		DestinationURL="notDefined"
	fi
	SourceUsername=($($input | grep -oP '(?<=SourceUsername>)[^<]+'))
	if [ "$SourceUsername" = "" ]; then
		SourceUsername="notDefined"
	fi
	SourcePassword=($($input | grep -oP '(?<=SourcePassword>)[^<]+'))
	if [ "$SourcePassword" = "" ]; then
		SourcePassword="notDefined"
	fi
	DestinationUsername=($($input | grep -oP '(?<=DestinationUsername>)[^<]+'))
	if [ "$DestinationUsername" = "" ]; then
		DestinationUsername="notDefined"
	fi
	DestinationPassword=($($input | grep -oP '(?<=DestinationPassword>)[^<]+'))
	if [ "$DestinationPassword" = "" ]; then
		DestinationPassword="notDefined"
	fi
	TenantDomains=($($input | grep -oP '(?<=TenantDomains>)[^<]+'))
	if [ "$TenantDomains" = "" ]; then
		TenantDomains="notDefined"
	fi
	TrustStorePassword=($($input | grep -oP '(?<=TrustStorePassword>)[^<]+'))
	if [ "$TrustStorePassword" = "" ]; then
		TrustStorePassword="notDefined"
	fi
	TrustStoreLocation=($($input | grep -oP '(?<=TrustStoreLocation>)[^<]+'))
	if [ "$TrustStoreLocation" = "" ]; then
		TrustStoreLocation="notDefined"
	fi
	SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
	java -cp :$SCRIPT_DIR/../../../repository/components/plugins/* org.wso2.carbon.dashboards.migrationtool.DSPortalAppMigrationTool $SourceDir $DestinationDir $SourceURL $SourceUsername $SourcePassword $DestinationURL $DestinationUsername $DestinationPassword $TenantDomains $TrustStoreLocation $TrustStorePassword
else
	echo "Error in input.xml file. 'Mode' attribute should be 'CAR' or 'Portal'"
	exit 1
fi