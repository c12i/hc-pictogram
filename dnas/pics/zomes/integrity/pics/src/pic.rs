use hdi::prelude::*;
#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Pic {
    pub image: EntryHash,
    pub story: String,
}
pub fn validate_create_pic(
    _action: EntryCreationAction,
    _pic: Pic,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_update_pic(
    _action: Update,
    _pic: Pic,
    _original_action: EntryCreationAction,
    _original_pic: Pic,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from("Pics cannot be updated")))
}
pub fn validate_delete_pic(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_pic: Pic,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
