function setup_micro_replacements
    function nano
        ox $argv
    end

    function vim
        ox $argv
    end

    function cat
        ox $argv
    end

    function bat
        ox $argv
    end

    function sudo
        if test (count $argv) -ge 2
            switch $argv[1]
                case nano vim cat bat
                    command sudo ox $argv[2..-1]
                case '*'
                    command sudo $argv
            end
        else
            command sudo $argv
        end
    end

    set -gx EDITOR ox
    set -gx VISUAL ox
end
