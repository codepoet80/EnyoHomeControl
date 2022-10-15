DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
echo copying latest common components
# cp $DIR/../../webos-common/Enyo/Update-Helper.js $DIR/../enyo-app/helpers/Updater.js
$DIR/../build.sh webos
palm-install $DIR/../bin/com.jonandnic.enyo.homecontrol_1.0.0_all.ipk
palm-launch com.jonandnic.enyo.homecontrol
palm-log -f com.jonandnic.enyo.homecontrol
