{
  pkgs ? import <nixpkgs> { },
}:
pkgs.mkShell {
  buildInputs = with pkgs; [
    bun
    prettier
    typescript
    eslint
    codebook
  ];

  shellHook = ''
    echo "entered shell.nix"
  '';
}