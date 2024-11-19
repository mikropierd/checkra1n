function gh
    if test (count $argv) -ge 3 -a "$argv[1]" = "repo" -a "$argv[2]" = "clone"
        set -l repo_name $argv[-1]
        command gh $argv
        if test $status -eq 0
            set -l dir_name (basename $repo_name .git)
            cd $dir_name
            eza -1 --icons=always --group-directories-first --no-symlinks -a
            set -g _custom_prompt_dir $dir_name
            function _custom_prompt --on-event fish_prompt
                echo -n "$_custom_prompt_dir ) "
                set -e _custom_prompt_dir
                functions -e _custom_prompt
            end
            commandline -f repaint
        end
    else
        command gh $argv
    end
end

function git
    if test (count $argv) -ge 2 -a "$argv[1]" = "clone"
        set -l repo_name $argv[-1]
        command gix $argv >/dev/null 2>&1
        and begin
            set -l dir_name (basename $repo_name .git)
            cd $dir_name
            eza -1 --icons=always --group-directories-first --no-symlinks -a
            set -g _custom_prompt_dir $dir_name
            function _custom_prompt --on-event fish_prompt
                echo -n "$_custom_prompt_dir ) "
                set -e _custom_prompt_dir
                functions -e _custom_prompt
            end
            commandline -f repaint
        end
    else
        command gix $argv
    end
end

function gix
    if test (count $argv) -ge 2 -a "$argv[1]" = "clone"
        set -l repo_name $argv[-1]
        command gix $argv >/dev/null 2>&1
        and begin
            set -l dir_name (basename $repo_name .git)
            cd $dir_name
            eza -1 --icons=always --group-directories-first --no-symlinks -a
            set -g _custom_prompt_dir $dir_name
            function _custom_prompt --on-event fish_prompt
                echo -n "$_custom_prompt_dir ) "
                set -e _custom_prompt_dir
                functions -e _custom_prompt
            end
            commandline -f repaint
        end
    else
        command gix $argv
    end
end