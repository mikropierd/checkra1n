alias brewfile='brew bundle dump --force'

if test -f (brew --prefix)/etc/brew-wrap.fish
  source (brew --prefix)/etc/brew-wrap.fish

end

set -gx PATH /opt/homebrew/bin $PATH
set -U fish_user_paths /opt/homebrew/bin $fish_user_paths


set -x PATH $PATH /Users/checkra1n/.local/bin
fish_add_path /opt/homebrew/opt/mozjpeg/bin
set -gx LDFLAGS "-L/opt/homebrew/opt/mozjpeg/lib"
set -gx CPPFLAGS "-I/opt/homebrew/opt/mozjpeg/include"
set -gx PKG_CONFIG_PATH "/opt/homebrew/opt/mozjpeg/lib/pkgconfig"

  
set -Ua fish_user_paths "$HOME/.rye/shims"

bind \e\[122\;9u 'commandline -f undo'
bind \e\[9\;5u 'commandline -f complete-and-search'

set -x MICRO_TRUECOLOR 1
export "MICRO_TRUECOLOR=1" 

set -Ux FZF_DEFAULT_OPTS "\
--color=bg+:#ccd0da,bg:#eff1f5,spinner:#dc8a78,hl:#d20f39 \
--color=fg:#4c4f69,header:#d20f39,info:#8839ef,pointer:#dc8a78 \
--color=marker:#7287fd,fg+:#4c4f69,prompt:#8839ef,hl+:#d20f39 \
--color=selected-bg:#bcc0cc \
--multi"


eval "$(/opt/homebrew/bin/brew shellenv)"

set -gx EDITOR ox
set -gx VISUAL ox

set -g fish_greeting
set -x PATH $PATH /Users/checkra1n/.cargo/bin

set -a fish_function_path ~/.config/fish/functions
fish_add_path /opt/homebrew/opt/ruby/bin
set -gx LDFLAGS "-L/opt/homebrew/opt/ruby/lib"
set -gx CPPFLAGS "-I/opt/homebrew/opt/ruby/include"
set -gx PKG_CONFIG_PATH "/opt/homebrew/opt/ruby/lib/pkgconfig"



set -x MANPAGER "sh -c 'col -bx | bat -l man -p'"


set -gx HOMEBREW_PREFIX "/opt/homebrew"
set -gx HOMEBREW_CELLAR "$HOMEBREW_PREFIX/Cellar"
set -gx HOMEBREW_REPOSITORY "$HOMEBREW_PREFIX/homebrew"

if status is-interactive
    # Capture Homebrew's shell environment
    set brew_env (brew shellenv)

    # Process each line of the Homebrew environment
    for line in $brew_env
        if string match -q "export PATH=*" -- $line
            # Handle PATH separately
            set path_value (string split -m1 = $line)[2]
            set -gx PATH (string trim -c '"' $path_value) $PATH
        else if string match -q "export *" -- $line
            # Handle other exports
            set -l kv (string split -m1 = (string sub -s 8 $line))
            set -gx $kv[1] (string trim -c '"' $kv[2])
        end
    end
end

set -x HOMEBREW_NO_AUTO_UPDATE 1
set -x HOMEBREW_NO_INSTALL_CLEANUP 1
set -x HOMEBREW_NO_ANALYTICS 1
set -x HOMEBREW_NO_COLOR 1
set -x HOMEBREW_CASK_OPTS "--no-quarantine"
set -x HOMEBREW_NO_ENV_HINTS 1

abbr -a update topgrade
abbr -a upgrade topgrade

alias ls='eza -1 --icons=always --group-directories-first --no-symlinks -a'

alias rm='rip'
alias cd='z'


set -Ux fifc_editor bat

set -a fish_complete_path /opt/homebrew/share/fish/vendor_completions.d
set -a fish_function_path /opt/homebrew/share/fish/vendor_functions.d
set -a fish_complete_path /opt/homebrew/share/fish/completions
set -a fish_function_path /opt/homebrew/share/fish/functions

if set -q KITTY_INSTALLATION_DIR
    set --global KITTY_SHELL_INTEGRATION enabled
    source "$KITTY_INSTALLATION_DIR/shell-integration/fish/vendor_conf.d/kitty-shell-integration.fish"
    set --prepend fish_complete_path "$KITTY_INSTALLATION_DIR/shell-integration/fish/vendor_completions.d"
end


set -g fish_pager_color_progress
set -g fish_pager_max_lines 0
set -g fish_pager_min_lines 0

# Lazy load setup functions
setup_micro_replacements
zoxide init fish | source
fzf --fish | source

# pnpm
set -gx PNPM_HOME "/Users/checkra1n/Library/pnpm"
if not string match -q -- $PNPM_HOME $PATH
  set -gx PATH "$PNPM_HOME" $PATH
end
# pnpm end

set -gx NPM_CONFIG_FUND false
fish_add_path /opt/homebrew/opt/ruby/bin

# bun
set --export BUN_INSTALL "$HOME/.bun"
set --export PATH $BUN_INSTALL/bin $PATH

# Created by `pipx` on 2024-10-10 07:43:55
set PATH $PATH /Users/checkra1n/.local/bin
uv generate-shell-completion fish | source
uvx --generate-shell-completion fish | source
