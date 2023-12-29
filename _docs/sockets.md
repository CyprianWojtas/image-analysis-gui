# Socket messages

## Sever Listeners

| Name | Params | Description |
| :-- | :-- | :-- |
| analysis_run    | analysisId: string | runs the analysis, starts one if not active |
| analysis_status | analysisId: string | get the analysis status: if active, sovled nodes and errors |
| analysis_reset_nodes | analysisId: string<br>nodes: string[] | resets nodes, removes their outputs and adds them back to the to-solve list |
| analysis_update | analysisId: string<br>data: string<br>nodes: string[] | updates analysis nodes and connections, resets passed nodes |
| analysis_get_node_data | analysisId: string | requests GUI data from the analysis |
| analysis_set_paused | analysisId: string<br>paused: boolean | marks analysis as paused or unpaused |
| analysis_stop | analysisId: string | stops the analysis |

## Client Listeners

| Name | Params | Description |
| :-- | :-- | :-- |
| analysis_node_processing | analysisId: string<br>nodeId: string | when node starts procesing |
| analysis_node_processed | analysisId: string<br>nodeId: string<br>? data: any | when node has been processed |
| analysis_node_error | analysisId: string<br>nodeId: string<br>error: string | when error has been thrown during node processing |
| analysis_node_data | analysisId: string<br>nodeId: string<br>data: any | response to 'analysis_get_node_data' sends GUI data for a specific node |
| analysis_status | analysisId: string<br>active: boolean<br>paused: boolean<br>solvedNodes: string[]<br>errors: { [nodeId: string]: string } | response to emited 'analysis_status'; gets analysis info |
| analysis_updated | analysisId: string | response to emited 'analysis_updated'; analysis has been updated |