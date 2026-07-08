# 🖥️ Comprehensive Unix Cheat Sheet & Exam Prep Guide

This guide covers the core Unix concepts, command structures, advanced text processing tools (`grep`, `sed`, `awk`), and reasoning logical paradigms necessary to tackle mid-level placement exam multiple-choice questions (MCQs).

---

## 📁 1. File System Navigation & Directory Management

### Core Commands
* **`pwd`** -> **P**rint **W**orking **D**irectory. Outputs absolute path from root `/` to current location.
* **`cd [dir]`** -> **C**hange **D**irectory. Moves workspace focus to target path.
* **`cd`** or **`cd ~`** -> Returns directly to user's home directory.
* **`cd ..`** -> Moves up one level to the parent directory.
* **`cd -`** -> Toggles back to the previous working directory before the last move.
* **`mkdir [dir]`** -> **M**a**k**e **D**irectory. Creates a new empty folder.
* **`rmdir [dir]`** -> **R**e**m**ove **D**irectory. Deletes a folder *only* if it is completely empty.

### Command Options & Flags to Memorize
* **`mkdir -p [path/to/dir]`** -> Creates nested **p**arent directories automatically if they do not exist. Prevents failure errors.
* **`ls`** -> **L**i**s**t directory contents. Default view skips hidden items.
* **`ls -l`** -> **Long format** listing. Displays permissions, links, owner, group, file size, and last modification timestamp.
* **`ls -a`** -> Lists **all** files including hidden files (those prefixed with a dot `.`).
* **`ls -lh`** -> Long format with **human-readable** file sizes (e.g., 4K, 25M, 2G).
* **`ls -t`** -> Sorts file output by **time** modified (newest first).
* **`ls -R`** -> **Recursive** listing. Displays contents of all subdirectories within the target root.

### 🧠 Reasoning Logic for Guessing
* If an exam question mentions a **hidden file** or a configuration file (like `.bashrc`), look for **`-a`** in the options.
* If a question asks for details regarding **file size, owner, or permissions**, look for **`-l`**.

---

## 📄 2. File Manipulation & Processing

### Core Commands
* **`touch [file]`** -> Creates an empty file if it doesn't exist; updates the file access/modification time if it does exist.
* **`cp [source] [dest]`** -> **C**o**p**y files or directories from source to destination.
* **`mv [source] [dest]`** -> **M**o**v**e or rename a file or directory.
* **`rm [file]`** -> **R**e**m**ove/delete file permanently.

### Command Options & Flags to Memorize
* **`cp -r [src_dir] [dest_dir]`** -> **Recursive** copy. Mandatory flag for duplicating folders with internal content.
* **`cp -p [src] [dest]`** -> **Preserves** file attributes like modification time, access time, and original permissions.
* **`rm -r [dir]`** -> **Recursive** removal. Deletes a folder and all its contents.
* **`rm -f [file]`** -> **Force** removal. Deletes write-protected files without asking for confirmation.
* **`rm -rf [dir]`** -> Deletes everything inside a directory forcefully and recursively.

### 🧠 Reasoning Logic for Guessing
* Any action involving **folders/directories** (copying or deleting) almost always requires the **`-r`** or **`-R`** (Recursive) flag.
* If the operation needs to run silently or bypass interactive warnings, look for **`-f`** (Force).

---

## 👁️ 3. File Content Viewing & Inspection

### Core Commands
* **`cat [file]`** -> **Conca**tena**t**e and display the entire contents of a file on the screen.
* **`tac [file]`** -> Inverse of `cat`. Displays file content upside-down (last line first).
* **`more [file]`** -> Views file content page-by-page (can only scroll forward using the spacebar).
* **`less [file]`** -> Advanced viewer. Allows multi-directional navigation (up/down arrow keys) and optimized memory handling for large files.
* **`head [file]`** -> Displays the top part of a file. Default view is the first 10 lines.
* **`tail [file]`** -> Displays the bottom part of a file. Default view is the last 10 lines.
* **`wc [file]`** -> **W**ord **C**ount tracking utility.

### Command Options & Flags to Memorize
* **`head -n [X] [file]`** -> Shows the exact first **X** lines of a file.
* **`tail -n [X] [file]`** -> Shows the exact last **X** lines of a file.
* **`tail -f [file]`** -> **Follow** mode. Keeps the file open and displays new lines added in real-time (crucial for log file debugging).
* **`wc -l [file]`** -> Outputs the total number of **lines** in a file.
* **`wc -w [file]`** -> Outputs the total number of **words** in a file.
* **`wc -c [file]`** -> Outputs the total number of **bytes/characters** in a file.

### 🧠 Reasoning Logic for Guessing
* If the exam asks you to monitor an active web server log or application update stream, look for **`tail -f`**.
* If asked to count total records or items generated in a pipeline, look for **`wc -l`**.

---

## 🔀 4. I/O Redirection, Streams & Pipelines

### Stream File Descriptors
* **`0`** -> `stdin` (Standard Input - Keyboard)
* **`1`** -> `stdout` (Standard Output - Terminal Screen)
* **`2`** -> `stderr` (Standard Error - Error Messages on Screen)

### Redirection Operators
* **`command < file`** -> Redirects standard input to read from `file` instead of the keyboard.
* **`command > file`** -> Redirects `stdout` to a file. **Overwrites** the file if it exists.
* **`command >> file`** -> Redirects `stdout` to a file. **Appends** data to the bottom without erasing existing content.
* **`command 2> file`** -> Captures only `stderr` and writes it to a file.
* **`command > file 2>&1`** or **`command &> file`** -> Merges both `stdout` (1) and `stderr` (2) into the same file target.
* **`command1 | command2`** -> **The Pipe**. Sends the `stdout` of `command1` directly as the `stdin` to `command2`.

### 🧠 Reasoning Logic for Guessing
* Double arrows (`>>`) always mean **append/keep old data**. Single arrows (`>`) mean **wipe out and start fresh**.
* Order matters: `2>&1` means "send channel 2 (errors) to wherever channel 1 (regular output) is going".

---

## 🔍 5. Advanced Text Processing (`grep`, `sed`, `awk`)

### A. `grep` (Global Regular Expression Print)
Used to scan files for lines that match a specific text pattern.

* **`grep "pattern" file`** -> Prints all lines containing the literal string "pattern".
* **`grep -i "pattern" file`** -> **Case-insensitive** search (matches "Pattern", "PATTERN", etc.).
* **`grep -v "pattern" file`** -> **Inverts** match. Prints lines that **do not** contain the specified pattern.
* **`grep -n "pattern" file`** -> Prints matching lines along with their original **line numbers**.
* **`grep -c "pattern" file`** -> Outputs only the total **count** of matching lines.
* **`grep -l "pattern" file1 file2`** -> Prints only the **names** of files that contain matches.
* **`grep -w "pattern" file`** -> Matches only whole **words** (searching for "an" won't match "pan").

### B. `sed` (Stream Editor)
Used for automated, non-interactive text parsing and programmatic string substitutions.

* **Syntax Pattern:** `sed 's/find_str/replace_str/modifier' file`
* **`sed 's/apple/orange/' file`** -> Substitutes only the **first** occurrence of "apple" with "orange" on each individual line.
* **`sed 's/apple/orange/g' file`** -> **Global** substitution. Changes every single occurrence across the entire file.
* **`sed -i 's/apple/orange/g' file`** -> **Inline** edit. Saves the modifications directly into the original file instead of streaming output to the terminal screen.
* **`sed 'd' file`** -> Delete command context block.
* **`sed '3d' file`** -> Deletes line number 3 from the streaming output display.

### C. `awk` (Pattern Scanning & Processing Language)
An advanced tool used for processing structured data arranged in columns/fields.

* **Default Behavior:** `awk` assumes whitespace (spaces or tabs) splits columns unless told otherwise.
* **`awk '{print $1}' file`** -> Prints the **first column** of every line.
* **`awk '{print $0}' file`** -> Prints the **entire** line content block.
* **`awk '{print $NF}' file`** -> Prints the **Number of Fields** variable contents (the **last column** of the line).
* **`awk -F',' '{print $2}' file`** -> Changes the Field Separator flag (**`-F`**) to a comma. Useful for parsing `.csv` sheets.
* **`awk '/error/ {print $3}' file`** -> Conditional filter. Searches for lines containing the word "error", then prints their respective 3rd column.

### 🧠 Reasoning Logic for Guessing
* If the task is strictly about finding strings or counting matches -> Choose **`grep`**.
* If the task is about finding and replacing words or editing a file automatically -> Choose **`sed`**.
* If the task involves columns, table configurations, comma-separated sheets, or fields -> Choose **`awk`**.

---

## 🔒 6. File Permissions & Ownership (`chmod`, `chown`)

### Permission Blocks Breakdown
When running `ls -l`, permissions display as a 10-character string: `-rwxr-xr--`
* Character 1 -> File type indicator (`-` = regular file, `d` = directory).
* Characters 2-4 -> **User/Owner** (`u`) permissions.
* Characters 5-7 -> **Group** (`g`) permissions.
* Characters 8-10 -> **Others** (`o`) permissions.

### Numerical Octal Weights
* **`read (r)`** = 4
* **`write (w)`** = 2
* **`execute (x)`** = 1
* **`no permission (-)`** = 0

### Calculation Reference Cheat Sheet
* `7` = 4 + 2 + 1 (read, write, execute)
* `6` = 4 + 2 (read, write)
* `5` = 4 + 1 (read, execute)
* `4` = read-only

### Utility Commands
* **`chmod 755 file`** -> Sets full rights (7) to owner, read/execute (5) to group, read/execute (5) to others.
* **`chmod u+x file`** -> Symbolic modifier mode. Adds (**`+`**) execute (**`x`**) permission to user (**`u`**).
* **`chmod g-w file`** -> Removes (**`-`**) write permission from group (**`g`**).
* **`chown user1 file`** -> Changes file owner to user1.
* **`chown user1:group1 file`** -> Changes both file owner (user1) and assigned group (group1) simultaneously.

### 🧠 Reasoning Logic for Guessing
* Memorize the baseline triad code: **`4-2-1`**. 
* If asked to block out everyone except the owner, the octal code should end in two zeros (e.g., `chmod 700`).

---

## ⚙️ 7. Process Management & System Inspection

### Core Commands
* **`ps`** -> Displays a snapshot of active user runtime processes.
* **`top`** -> Interactive live system monitor displaying CPU usage, memory consumption, and running task threads.
* **`kill [PID]`** -> Terminates a process using its explicit numeric Process ID.
* **`df`** -> **D**isk **F**ree space summary across all mounted hardware partitions.
* **`du`** -> **D**isk **U**sage estimation for files and folder storage blocks.

### Command Options & Flags to Memorize
* **`ps -ef`** or **`ps aux`** -> Displays **every** process running on the entire system with comprehensive detail columns.
* **`kill -9 [PID]`** -> Sends a **SIGKILL** signal. Forces immediate, uncatchable termination of a stuck process.
* **`kill -15 [PID]`** -> Sends a **SIGTERM** signal (default behavior). Asks a process to terminate gracefully.
* **`df -h`** -> Human-readable disk partition sizing.
* **`du -sh [dir]`** -> Provides a human-readable (**`-h`**) single summary size (**`-s`**) of a folder.

### 🧠 Reasoning Logic for Guessing
* If the exam specifies a process *cannot be blocked* or must be destroyed *unconditionally*, look for **`kill -9`**.
* If asked to check hard drive space across the system, use **`df`** (disk free). If looking at a single folder size, use **`du`** (disk usage).

---

## 🗃️ 8. Search, Compression & Utility Tools

### Core Commands
* **`find [start_path] -options`** -> Recursively searches for files and directories matching explicit metadata criteria.
* **`tar`** -> **T**ape **A**rchive utility. Bundles multiple files together into a single `.tar` archive file.

### Command Options & Flags to Memorize
* **`find . -name "test.txt"`** -> Searches from current location (`.`) for a file named "test.txt".
* **`find /var -mtime -7`** -> Finds items inside `/var` modified within the last 7 days.
* **`tar -cvf archive.tar dir/`** -> **C**reates an archive file, with **v**erbose logs, using a designated **f**ilename.
* **`tar -xvf archive.tar`** -> **E(x)tracts** contents from the target archive file.
* **`tar -czvf archive.tar.gz dir/`** -> Creates a compressed archive using **z**ip (`gzip`) algorithm formatting.

### 🧠 Reasoning Logic for Guessing
* For matching filenames or finding files by age/size -> Choose **`find`**.
* For inspecting strings *inside* text contents -> Choose **`grep`**.

---

## 📜 9. Shell Scripting Variables & Logic Controls

### Special Positional Parameters
* **`$?`** -> Exit status of the most recently executed foreground command. **0 means success**, any non-zero value (1-255) indicates a specific error or failure.
* **`$$`** -> Process ID (PID) of the current running shell script environment.
* **`$#`** -> Counts total number of arguments passed into a script command line.
* **`$1, $2 ... $9`** -> Positional variables representing arguments passed into the script execution call.

### String & Integer Conditional Operators (Inside `[ ]`)
* **`[ -z "$var" ]`** -> True if string length is **zero** (the variable is empty).
* **`[ -n "$var" ]`** -> True if string length is **non-zero** (the variable contains data).
* **`[ $a -eq $b ]`** -> True if integer `a` **equals** `b`.
* **`[ $a -ne $b ]`** -> True if integer `a` is **not equal** to `b`.
* **`[ $a -gt $b ]`** -> True if integer `a` is **greater than** `b`.
* **`[ $a -lt $b ]`** -> True if integer `a` is **less than** `b`.

### 🧠 Reasoning Logic for Guessing
* Shell scripting uses alphabetic shorthand for math checks: `-eq` (equal), `-ne` (not equal), `-gt` (greater than), `-lt` (less than).
* Checking for a successful program completion always involves evaluating `if [ $? -eq 0 ]`.
