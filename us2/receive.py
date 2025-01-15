import os
import requests
from pynetdicom import (
     AE, debug_logger, evt, AllStoragePresentationContexts,
     ALL_TRANSFER_SYNTAXES
 )


debug_logger()


def handle_convert(file_url, file_name):
    # set the endpoint URL
    url = "http://localhost:3001/iopc/dicom?"+"file_name="+file_name

    # open the form data file and read its contents
    with open(file_url, "rb") as f:
        file_data = f.read()

    payload = {
        "file": file_data,
    }

    # make the HTTP POST request with the form data payload
    response = requests.post(url, files=payload)

    if response.status_code == 200:
        print("DICOM Converted Success: "+ file_url)


# Implement a handler for evt.EVT_C_STORE
def handle_store(event):
    """Handle a C-STORE request event."""
    # Decode the C-STORE request's *Data Set* parameter to a pydicom Dataset
    ds = event.dataset

    # Add the File Meta Information
    ds.file_meta = event.file_meta

    # Save the dataset using the SOP Instance UID as the filename
    file_name = str(ds.SOPInstanceUID)
    file_url = file_name+".dcm"

    print("file_url:"+file_url)
    ds.save_as(file_url, write_like_original=False)
    handle_convert(file_url, file_name)
    # Return a 'Success' status
    return 0x0000

handlers = [(evt.EVT_C_STORE, handle_store)]

# Initialise the Application Entity
ae = AE()


storage_sop_classes = [cx.abstract_syntax for cx in AllStoragePresentationContexts]
for uid in storage_sop_classes:
    ae.add_supported_context(uid, ALL_TRANSFER_SYNTAXES)

# Support presentation contexts for all storage SOP Classes
#ae.supported_contexts = AllStoragePresentationContexts

# Start listening for incoming association requests
ae.start_server(("127.0.0.1", 12345), evt_handlers=handlers)
