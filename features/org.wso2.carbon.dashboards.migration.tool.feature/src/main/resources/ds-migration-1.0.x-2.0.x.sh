#!/bin/sh
if [ "$2" = "CAR" ]; then
	if [ "$3" = "-Dsrcdir" ]; then
		if [ "$4" != "" ]; then
			SRC_DIR=$4
		else
			echo "Source Directory cannot be null"
			echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir>'"
			exit 1
		fi
	else
		echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir>'"
		exit 1
	fi
	if [ "$5" = "-Ddestdir" ]; then
		if [ "$6" != "" ]; then
			DEST_DIR=$6
		else
			echo "Destination Directory cannot be null"
			echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir>'"
			exit 1
		fi
	else
		echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir>'"
		exit 1
	fi
	SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
	java -cp $SCRIPT_DIR/org.wso2.carbon.dashboard.migration.tool-2.0.2-SNAPSHOT.jar:$SCRIPT_DIR/* org.wso2.carbon.dashboards.migrationtool.DSCarFileMigrationTool $SRC_DIR $DEST_DIR
elif [ "$2" = "Portal" ]; then
	if [ "$3" = "-Dsrcdir" ]; then
		if [ "$4" != "" ]; then
			SRC_DIR=$4
		else
			echo "Source Directory cannot be null"
			echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir> -Dadmin.username <username> -Dadmin.password <password>'"
			exit 1
		fi
	else
		echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir> -Dadmin.username <username> -Dadmin.password <password>'"
		exit 1
	fi
	if [ "$5" = "-Ddestdir" ]; then
		if [ "$6" != "" ]; then
			DEST_DIR=$6
		else
			echo "Destination Directory cannot be null"
			echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir> -Dadmin.username <username> -Dadmin.password <password>'"
			exit 1
		fi
	else
		echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir> -Dadmin.username <username> -Dadmin.password <password>'"
		exit 1
	fi
	if [ "$7" = "-Dadmin.username" ]; then
		if [ "$8" != "" ]; then
			USERNAME=$8
		else
			echo "Admin Username cannot be null"
			echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir> -Dadmin.username <username> -Dadmin.password <password>'"
			exit 1
		fi
	else
		echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir> -Dadmin.username <username> -Dadmin.password <password>'"
		exit 1
	fi
	if [ "$9" = "-Dadmin.password" ]; then
		if [ "$10" != "" ]; then
			PASSWORD=$10
		else
			echo "Admin password cannot be null"
			echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir> -Dadmin.username <username> -Dadmin.password <password>'"
			exit 1
		fi
	else
		echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir> -Dadmin.username <username> -Dadmin.password <password>'"
		exit 1
	fi
	SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
	java -cp $SCRIPT_DIR/org.wso2.carbon.dashboard.migration.tool-2.0.2-SNAPSHOT.jar:$SCRIPT_DIR/* org.wso2.carbon.dashboards.migrationtool.DSPortalAppMigrationTool $SRC_DIR $DEST_DIR $USERNAME $PASSWORD
else
	echo "Please enter arugments as '-Dmode <CAR/Portal> -Dsrcdir <source dir> -Destdir <destination dir> -Dadmin.username <username> -Dadmin.password <password>'"
	exit 1
fi
