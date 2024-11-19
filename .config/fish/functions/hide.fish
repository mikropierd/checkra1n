function hide
    if test (count $argv) -eq 0
        echo "Usage: hide <path/to/file_or_directory>"
        return 1
    end

    set -l target $argv[1]
    
    if test -e $target
        set -l basename (basename $target)
        set -l hidden_name ".$basename"
        set -l dirname (dirname $target)
        
        mv $target $dirname/$hidden_name
        echo "Hidden: $target -> $dirname/$hidden_name"
    else
        echo "Error: $target does not exist"
        return 1
    end
end