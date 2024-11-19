#!/bin/bash

# Loads defined colors
source "$CONFIG_DIR/colors.sh"

CURRENT_WIFI="$(ipconfig getsummary en0)"
IP_ADDRESS="$(echo "$CURRENT_WIFI" | grep -o "yiaddr = .*" | sed 's/^yiaddr = //')"
SSID="$(echo "$CURRENT_WIFI" | grep -o "SSID : .*" | sed 's/^SSID : //' | tail -n 1)"

# Function to check if the connection is your iPhone hotspot
is_iphone_hotspot() {
    local ssid="$1"
    if [[ "$ssid" == "Bromantane" ]]; then
        return 0 # True
    else
        return 1 # False
    fi
}

if [[ $SSID != "" ]]; then
    if is_iphone_hotspot "$SSID"; then
        ICON_COLOR=$(getcolor white)
        ICON=􀉤
        ICON_FONT="JetBrainsMono Nerd Font:Regular:13.0"
    else
        ICON_COLOR=$(getcolor white)
        ICON=󰖩
        ICON_FONT="JetBrainsMono Nerd Font:Regular:13.0"  # Increased font size for WiFi icon
    fi
else
    ICON_COLOR=$(getcolor white 25)
    ICON=󰖪
    ICON_FONT="JetBrainsMono Nerd Font:Regular:13.0"
fi

render_bar_item() {
  sketchybar --set $NAME \
    icon.color=$ICON_COLOR \
    icon=$ICON \
    icon.font="$ICON_FONT"
}

render_popup() {
  if [ "$SSID" != "" ]; then
    args=(
      --set wifi.ssid label="$SSID"
      --set wifi.ipaddress label="$IP_ADDRESS"
      click_script="printf $IP_ADDRESS | pbcopy;sketchybar --set wifi popup.drawing=toggle"
    )
  else
    args=(
      --set wifi.ssid label="Not connected"
      --set wifi.ipaddress label="No IP"
      )
  fi

  sketchybar "${args[@]}" >/dev/null
}

update() {
  render_bar_item
  render_popup
}

popup() {
  sketchybar --set "$NAME" popup.drawing="$1"
}

case "$SENDER" in
"routine" | "forced")
  update
  ;;
"mouse.clicked")
  popup toggle
  ;;
esac
