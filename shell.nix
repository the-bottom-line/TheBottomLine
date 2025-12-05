{
  pkgs ? import <nixpkgs> { },
}:
pkgs.mkShell {
  buildInputs = with pkgs; [
    bun
    prettier
    typescript
    eslint
  ];

  shellHook = ''
    echo "entered shell.nix"
  '';
}