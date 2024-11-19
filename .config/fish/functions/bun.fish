function node
    if test (count $argv) -eq 0
        command bun repl
    else
        command bun $argv
    end
end

function npm
    switch $argv[1]
        case install i
            bun install $argv[2..-1]
        case run
            bun run $argv[2..-1]
        case test
            bun test $argv[2..-1]
        case '*'
            command npm $argv
    end
end

function npx
    bun run $argv
end

function yarn
    switch $argv[1]
        case add
            bun install $argv[2..-1]
        case remove
            bun remove $argv[2..-1]
        case run
            bun run $argv[2..-1]
        case '*'
            command yarn $argv
    end
end

function pnpm
    switch $argv[1]
        case add install
            bun install $argv[2..-1]
        case remove uninstall rm
            bun remove $argv[2..-1]
        case run
            bun run $argv[2..-1]
        case exec
            bun run $argv[2..-1]
        case '*'
            command pnpm $argv
    end
end