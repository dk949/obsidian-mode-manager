# Mode manager

This plugin adds dedicated commands to switch to specific modes (reading, source
and live preview), rather than relying on the default toggle behaviour.

## Commands

| Name                                 | Description                                                         | ID (for use in scripting)             |
| ------------------------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| Mode manager: Switch to reading      | Switch to reading mode                                              | `mode-manager:switch-to-reading`      |
| Mode manager: Switch to live preview | Switch to live preview mode (edit with formatting preview)          | `mode-manager:switch-to-live-preview` |
| Mode manager: Switch to source       | Switch to source only edit mode                                     | `mode-manager:switch-to-source`       |
| Mode manager: Switch to edit         | Switch to edit mode and maintain existing source or preview setting | `mode-manager:switch-to-edit`         |
| Mode manager: Switch to next mode    | Cycle through modes in sequential order: reading, source, preview   | `mode-manager:switch-to-next-mode`    |


## Special properties


You can use a special property (`default-mode` by default, can be changed in
settings) to automatically switch to a specific mode when opening the file.

> [!NOTE]
> This is currently broken for daily notes opened on startup.
