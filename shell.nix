{
  pkgs ? import <nixpkgs> { },
}:
pkgs.mkShell {
  buildInputs = with pkgs; [
    bun
    prettier
    typescript
  ];

  shellHook = ''
    echo "entered shell.nix"
  '';
}