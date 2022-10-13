use anyhow::Error;
use std::{
    fmt,
    sync::{Arc, Mutex},
};
use swc_core::common::errors::{Handler, HANDLER};
use swc_core::common::sync::Lrc;
use swc_core::common::SourceMap;
use swc_error_reporters::{GraphicalReportHandler, PrettyEmitter, PrettyEmitterConfig};

pub fn setup_handler<F, Ret>(cm: Lrc<SourceMap>, op: F) -> Result<Ret, Error>
where
    F: FnOnce(&Handler, &LockedWriter) -> Result<Ret, Error>,
{
    let wr = Box::new(LockedWriter::default());

    let emitter = PrettyEmitter::new(
        cm.clone(),
        wr.clone(),
        GraphicalReportHandler::new(),
        PrettyEmitterConfig {
            skip_filename: false,
        },
    );

    let handler = Handler::with_emitter(true, false, Box::new(emitter));

    let ret = HANDLER.set(&handler, || op(&handler, &wr));

    #[cfg(test)]
    wr.display();

    ret
}

#[derive(Clone, Default)]
pub struct LockedWriter(Arc<Mutex<String>>);
impl LockedWriter {
    #[allow(dead_code)]
    fn display(&self) {
        println!("{}", self.get_display_str());
    }
    pub fn get_display_str(&self) -> String {
        self.0.lock().unwrap().to_string()
    }
}
impl fmt::Write for LockedWriter {
    fn write_str(&mut self, s: &str) -> fmt::Result {
        self.0.lock().unwrap().push_str(s);
        Ok(())
    }
}
