@cmd /c "updateJspsych.cmd"
@aws s3 sync .\public s3://builder.jspsych.org