function execute_with_hash_or_dollar
    set -l cmd (commandline -b)
    set -l first_char (string sub -s 1 -l 1 "$cmd")
    if test "$first_char" = "#" -o "$first_char" = "\$"
        commandline -r (string sub -s 2 "$cmd")
        commandline -f execute
    else
        commandline -f execute
    end
end

bind \r execute_with_hash_or_dollar