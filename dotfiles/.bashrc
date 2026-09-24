# ~/.bashrc - Interactive bash shell configuration

# Return early if non-interactive
case $- in
    *i*) ;;
      *) return;;
esac

# Suppress Python DeprecationWarnings
export PYTHONWARNINGS="${PYTHONWARNINGS:-ignore}"

# History settings
HISTCONTROL=ignoreboth
shopt -s histappend
HISTSIZE=1000
HISTFILESIZE=2000

# Update window size after each command
shopt -s checkwinsize

# Less input filter
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# Set debian_chroot if present
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# Set color prompt
case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	color_prompt=yes
    else
	color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt

# Set xterm title
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;\w\a\]$PS1"
    ;;
*)
    ;;
esac

# Color support for ls and grep
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# Standard aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# Include custom bash aliases if present
if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# Enable programmable completion
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi

# Environment variables
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin

# ------------------------------------------------------------------------------
# Python Virtual Environment Auto-Activation & Aliases
# ------------------------------------------------------------------------------
alias av="source venv/bin/activate"
alias dv="deactivate"

_check_venv() {
    local dir="$PWD"
    local venv_dir=""
    local activate_script=""

    # Check current directory first, then traverse up to $HOME
    while [ -n "$dir" ] && [ "$dir" != "/" ]; do
        if [ -r "$dir/.venv/bin/activate" ]; then
            venv_dir="$dir/.venv"
            activate_script="$dir/.venv/bin/activate"
            break
        elif [ -r "$dir/venv/bin/activate" ]; then
            venv_dir="$dir/venv"
            activate_script="$dir/venv/bin/activate"
            break
        fi

        [ "$dir" = "$HOME" ] && break
        dir=$(dirname "$dir")
    done

    if [ -n "$activate_script" ]; then
        if [ -n "$VIRTUAL_ENV" ] && [ "$VIRTUAL_ENV" = "$venv_dir" ]; then
            return 0
        fi

        if [ -n "$VIRTUAL_ENV" ] && declare -f deactivate >/dev/null 2>&1; then
            deactivate >/dev/null 2>&1 || true
        fi

        source "$activate_script" >/dev/null 2>&1
    elif [ -n "$VIRTUAL_ENV" ]; then
        if declare -f deactivate >/dev/null 2>&1; then
            deactivate >/dev/null 2>&1 || true
        else
            PATH=":$PATH:"
            PATH="${PATH//:$VIRTUAL_ENV\/bin:/:}"
            PATH="${PATH#:}"
            PATH="${PATH%:}"
            export PATH
            unset VIRTUAL_ENV
        fi
    fi
}

# Auto activate/deactivate on cd
cd() {
    builtin cd "$@" || return
    _check_venv
}

# ------------------------------------------------------------------------------
# Custom Commands & Project Management
# ------------------------------------------------------------------------------

open() {
    local use_vscode=0 only_dolphin=0 no_dolphin=0 kill_existing=0 chrome_file="" target_dir="" target_type=""

    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        cat << 'EOF'
USAGE:
  open                           Open current directory in Dolphin (background)
  open <path>                    Open file/folder with default app or Dolphin
  open -pr <project-name>        Open ~/Projects/<project> in Antigravity + Dolphin + Chrome
  open -mov                      Open /mnt/Vedant/Movies in Dolphin
  open -me                       Open /mnt/Vedant in Dolphin

OPTIONS:
  -v                             Use VS Code instead of Antigravity IDE
  -d                             Open only in Dolphin (foreground)
  -no-d                          Don't open in Dolphin
  -c <file>                      Open specified file in Chrome (projects only)
  -k                             Kill existing Antigravity/VS Code/Dolphin before opening
  -h, --help                     Show this help message

EXAMPLES:
  open                           # Current dir in Dolphin
  open /tmp                      # /tmp in Dolphin
  open /tmp/file.pdf             # Open PDF with default app
  open -pr myproject             # Full project setup
  open -pr myproject -v          # Use VS Code
  open -pr myproject -d          # Dolphin only (foreground)
  open -pr myproject -c index.html  # Chrome opens index.html
  open -pr myproject -no-d       # No Dolphin, just IDE + Chrome
  open -pr myproject -k          # Kill existing project windows, then open

FEATURES:
  • Auto-activates Python venv when opening projects
  • Venv restored in IDE terminals via PROMPT_COMMAND
  • Dolphin runs in background via setsid
  • Exit only in Konsole, not in IDE integrated terminals
EOF
        return
    fi

    while [[ $# -gt 0 ]]; do
        case "$1" in
            -pr)
                shift
                [ -z "$1" ] && { echo "Usage: open -pr <project-name> [-v] [-d] [-no-d] [-c file]"; return 1; }
                target_type="project"
                target_dir="$HOME/Projects/$1"
                ;;
            -mov)
                target_type="movies"
                target_dir="/mnt/Vedant/Movies"
                ;;
            -me)
                target_type="vedant"
                target_dir="/mnt/Vedant"
                ;;
            -v) use_vscode=1 ;;
            -d) only_dolphin=1 ;;
            -no-d) no_dolphin=1 ;;
            -k) kill_existing=1 ;;
            -c)
                shift
                chrome_file="$1"
                ;;
            *)
                target_dir="$1"
                target_type="path"
                ;;
        esac
        shift
    done

    [ -z "$target_dir" ] && { echo "Usage: open [-pr <project> | -mov | -me | <path>] [-v] [-d] [-no-d] [-c file]"; return 1; }
    [ ! -e "$target_dir" ] && { echo "Path not found: $target_dir"; return 1; }

    if [ "$kill_existing" -eq 1 ]; then
        echo "Closing existing project windows..."
        cur_pid=$$
        ancestors="$cur_pid"
        p=$cur_pid
        while [ -n "$p" ] && [ "$p" -ne 1 ]; do
            p=$(awk '/^PPid:/{print $2}' /proc/$p/status 2>/dev/null)
            [ -n "$p" ] && ancestors="$ancestors $p"
        done

        _is_ancestor() {
            local candidate="$1"
            for a in $ancestors; do
                if [ "$a" = "$candidate" ]; then
                    return 0
                fi
            done
            return 1
        }

        for cmd in antigravity-ide code dolphin; do
            for pid in $(pgrep -x "$cmd" 2>/dev/null || true); do
                if _is_ancestor "$pid"; then
                    continue
                fi
                kill -TERM "$pid" >/dev/null 2>&1 || kill -KILL "$pid" >/dev/null 2>&1 || true
            done
        done
        sleep 0.5
    fi

    if [ -f "$target_dir" ]; then
        setsid xdg-open "$target_dir" >/dev/null 2>&1
        return
    fi

    if [ "$no_dolphin" -eq 0 ]; then
        if [ "$only_dolphin" -eq 1 ]; then
            setsid dolphin "$target_dir" >/dev/null 2>&1
            return
        else
            setsid dolphin "$target_dir" >/dev/null 2>&1 &
        fi
    fi

    if [ "$only_dolphin" -eq 0 ] && [ "$target_type" = "project" ]; then
        if [ -f "$target_dir/.venv/bin/activate" ]; then
            source "$target_dir/.venv/bin/activate"
        elif [ -f "$target_dir/venv/bin/activate" ]; then
            source "$target_dir/venv/bin/activate"
        fi

        if [ "$use_vscode" -eq 1 ]; then
            code "$target_dir" >/dev/null 2>&1 &
        else
            antigravity-ide "$target_dir" >/dev/null 2>&1 &
        fi
    fi

    if [ -n "$chrome_file" ] && [ "$target_type" = "project" ]; then
        google-chrome "$target_dir/$chrome_file" >/dev/null 2>&1 &
    fi

    if [ -n "$KONSOLE_VERSION" ]; then
        exit
    fi
}

# Open browser to a URL or search query
search() {
    local browser="google-chrome"
    local new_window=0 kill_all=0 no_exit=0 incognito=0
    local OPTIND opt choice
    while getopts "hnkeib:" opt; do
        case "$opt" in
            h)
                cat <<'EOF'
search - open browser to a URL or search query
usage: search [-h] [-b browser] [-n] [-k] [-e] [-i] <query|url>
  -h  show this help
  -b  select browser: chrome|c, brave|b, firefox|f (default: chrome)
  -n  open in a new window
  -k  kill ALL target browser sessions first
  -e  don't exit the terminal after launch
  -i  open in incognito / private mode
  no query -> opens blank new tab/window
EOF
                return 0
                ;;
            b) choice="$OPTARG" ;;
            n) new_window=1 ;;
            k) kill_all=1 ;;
            e) no_exit=1 ;;
            i) incognito=1 ;;
            *)
                echo "search: invalid option" >&2
                return 1
                ;;
        esac
    done
    shift $((OPTIND - 1))
    case "$choice" in
        brave|b)       browser="brave-browser" ;;
        firefox|f)     browser="firefox" ;;
        chrome|c|"")   browser="google-chrome" ;;
        *)             browser="$choice" ;;
    esac
    if ! command -v "$browser" >/dev/null 2>&1; then
        echo "search: browser '$browser' not found" >&2
        return 1
    fi
    local q=""
    if [[ -n "$1" ]]; then
        q="$*"
        if [[ "$q" =~ ^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(/.*)?$ ]] || [[ "$q" =~ ^https?:// ]]; then
            [[ "$q" =~ ^https?:// ]] || q="https://$q"
        else
            local encoded
            encoded=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$q")
            q="https://www.google.com/search?q=$encoded"
        fi
    fi
    if [[ "$kill_all" -eq 1 ]]; then
        read -rp "Kill ALL $browser sessions? [y/N] " confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            pkill -f "$browser"
            sleep 1
        else
            echo "search: aborted -k"
            return 1
        fi
    fi
    local flags=()
    if [[ "$browser" == "firefox" ]]; then
        [[ "$new_window" -eq 1 || "$kill_all" -eq 1 ]] && flags+=(--new-window)
        [[ "$incognito" -eq 1 ]] && flags+=(--private-window)
    else
        [[ "$new_window" -eq 1 || "$kill_all" -eq 1 ]] && flags+=(--new-window)
        [[ "$incognito" -eq 1 ]] && flags+=(--incognito)
    fi
    setsid "$browser" "${flags[@]}" ${q:+"$q"} >/dev/null 2>&1 &
    if [[ "$no_exit" -eq 1 ]]; then
        return 0
    else
        sleep 1
        exit
    fi
}

man() {
    if [ "$1" = "open" ]; then
        open --help
    else
        command man "$@"
    fi
}

# >>> conda initialize >>>
__conda_setup="$(PYTHONWARNINGS=ignore '/home/vedant/miniconda3/bin/conda' 'shell.bash' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/home/vedant/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/home/vedant/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/home/vedant/miniconda3/bin:$PATH"
    fi
fi
unset __conda_setup

# <<< conda initialize <<<

# Auto-activate venv on shell startup if present in current directory
_check_venv


# Config Repo Sync Alias
alias sync-repo="/home/vedant/Projects/vedantmali05/sync.sh"
