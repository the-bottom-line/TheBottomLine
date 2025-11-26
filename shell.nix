{
  pkgs ? import <nixpkgs> { },
}:
pkgs.mkShell {
  buildInputs = with pkgs; [
    bun
    prettier
  ];

  shellHook = ''
    echo "entered shell.nix"
  '';
}