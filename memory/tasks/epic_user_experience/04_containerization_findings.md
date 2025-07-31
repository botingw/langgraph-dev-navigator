### **Issue: Resolved - Root Cause of Dockerized MCP Server Instability Identified**

**Status:** Resolved
**Author:** Boting Wang
**Date:** July 30, 2025

### 1. Executive Summary

The `crawl4ai-rag` Python MCP server experienced critical instability when run as a Docker container, manifesting as crashes (`Exited (137)`) and timeouts. After a thorough investigation, the definitive root cause was identified as **insufficient memory allocation**. The application's high memory requirement at startup exceeded the default resources provided by the Docker environment.

The immediate and effective solution was to increase the container's available memory. Further testing has shown that the server runs reliably with a dedicated memory allocation of **512MB**.

Several related, lower-priority issues concerning container lifecycle management and log output were also identified. These do not block current development and have been documented for future improvement.

### 2. Investigation and Resolved Issues

#### Problem 1: Resource Exhaustion (The True Root Cause - FIXED)
*   **Diagnosis:** The application's memory requirement at import time (driven by heavy libraries like `sentence-transformers`) exceeded the default memory allocated to the Docker environment. This was the fundamental cause of all observed instability.
*   **Evidence:** The definitive proof was capturing container exit codes:
    *   **`Exited (137)`:** Proved the process was killed by the Linux kernel's **Out Of Memory (OOM) Killer**.
    *   **`Exited (255)`:** Indicated a catastrophic crash immediately upon launch when the system denied its initial resource requests.
*   **Verification:** By methodically testing memory limits, we determined that the server becomes stable when launched with a sufficient memory reservation.
*   **Resolution:**
    1.  **System Level:** The total memory allocated to the Docker Desktop VM was increased via **Settings > Resources > Memory** to ensure enough capacity is available.
    2.  **Container Level:** A specific memory limit is now set in the `docker run` command using the `--memory "512m"` flag. This guarantees the container has the resources it needs to start reliably.

### 3. Documented Issues for Future Improvement

The following issues were identified during the investigation. While they do not currently block development, they are documented here for future hardening of the system.

#### Problem 2: Unreliable Container Lifecycle Management (Low Priority)
*   **Observation:** The AI client does not reliably stop and remove old containers when the server is disabled and re-enabled in the settings. This can lead to orphaned containers and `docker: Error... Conflict` errors if a fixed container name is used.
*   **Current Status:** This does not block development, but requires occasional manual cleanup (`docker rm ...`) or a full restart of the IDE to ensure a clean state.
*   **Potential Future Solution:** Implement a master `run_managed_server.sh` script that is called by the client. This script would handle the cleanup of old containers before launching a new one, making the process atomic and reliable. This will be addressed when developer friction becomes a bottleneck.

#### Problem 3: Contaminated `stdio` Channel (Low Priority)
*   **Observation:** The application occasionally prints non-JSON startup logs to its `stdout` channel. While this did not appear to be the cause of the primary failure, it is technically incorrect behavior for an MCP server and could cause issues with other, stricter clients. The MCP server should only output JSON-RPC messages to `stdout`.
*   **Current Status:** The current client (CLine) appears tolerant of this behavior, so it is not an immediate blocker.
*   **Potential Future Solution:** Refactor the Python application to ensure all diagnostic `print()` statements and library logs are redirected to standard error (`stderr`) using `print("...", file=sys.stderr)` or Python's standard `logging` module.

### 4. Final Implemented Solution

The core instability has been **resolved** by applying a specific memory limit to the container at launch:
*   The `docker run` command in the client configuration has been updated to include `--memory "512m"`.
*   The global Docker Desktop memory has been confirmed to be set high enough to accommodate this request.

This fix is stable, addresses the root cause directly, and unblocks all further development. The lower-priority issues are now tracked for future sprints.