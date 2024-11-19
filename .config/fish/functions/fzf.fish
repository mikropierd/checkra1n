function fzf_custom
    set -l result (compgen -c | sort -u | fzf --bind "change:reload:compgen -c | sort -u | grep -v '^/' || true" --bind "start:unbind(change)" --preview 'echo {}' --preview-window=hidden)
    if test -n "$result"
        commandline -r $result
    end
    commandline -f repaint
end

function fish_user_key_bindings
    bind \t 'commandline -f complete || fzf_custom'
end
