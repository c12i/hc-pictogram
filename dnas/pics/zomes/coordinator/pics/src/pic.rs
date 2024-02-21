use hdk::prelude::*;
use pics_integrity::*;
#[hdk_extern]
pub fn create_pic(pic: Pic) -> ExternResult<Record> {
    let pic_hash = create_entry(&EntryTypes::Pic(pic.clone()))?;
    let record = get(pic_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created Pic"))
            ),
        )?;
    let my_agent_pub_key = agent_info()?.agent_latest_pubkey;
    create_link(my_agent_pub_key, pic_hash.clone(), LinkTypes::MyPics, ())?;
    Ok(record)
}
#[hdk_extern]
pub fn get_pic(pic_hash: ActionHash) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(pic_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => {
            Err(
                wasm_error!(
                    WasmErrorInner::Guest(String::from("Malformed get details response"))
                ),
            )
        }
    }
}
#[hdk_extern]
pub fn delete_pic(original_pic_hash: ActionHash) -> ExternResult<ActionHash> {
    let details = get_details(original_pic_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("{pascal_entry_def_name} not found"))
            ),
        )?;
    let record = match details {
        Details::Record(details) => Ok(details.record),
        _ => {
            Err(
                wasm_error!(
                    WasmErrorInner::Guest(String::from("Malformed get details response"))
                ),
            )
        }
    }?;
    let links = get_links(record.action().author().clone(), LinkTypes::MyPics, None)?;
    for link in links {
        if let Some(hash) = link.target.into_action_hash() {
            if hash.eq(&original_pic_hash) {
                delete_link(link.create_link_hash)?;
            }
        }
    }
    delete_entry(original_pic_hash)
}
#[hdk_extern]
pub fn get_all_deletes_for_pic(
    original_pic_hash: ActionHash,
) -> ExternResult<Option<Vec<SignedActionHashed>>> {
    let Some(details) = get_details(original_pic_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Entry(_) => {
            Err(wasm_error!(WasmErrorInner::Guest("Malformed details".into())))
        }
        Details::Record(record_details) => Ok(Some(record_details.deletes)),
    }
}
#[hdk_extern]
pub fn get_oldest_delete_for_pic(
    original_pic_hash: ActionHash,
) -> ExternResult<Option<SignedActionHashed>> {
    let Some(mut deletes) = get_all_deletes_for_pic(original_pic_hash)? else {
        return Ok(None);
    };
    deletes
        .sort_by(|delete_a, delete_b| {
            delete_a.action().timestamp().cmp(&delete_b.action().timestamp())
        });
    Ok(deletes.first().cloned())
}
