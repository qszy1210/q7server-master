function compile(projects, branch) {
    let url;
        url = `http://ops.q7link.com:8080/api/qqdeploy/projectbuild/`;
    ajax({
        type: "POST",
        url,
        dataType: "json",
        data: {
            projects: projects.join(','),
            branch,
        }
    }).then(d=>{
        $('#b_compile').text(d.msg);
        setTimeout(() => {
            $('#b_compile').text('compile');
        }, 1500);
    });
}

$(function(){

    const $container = $("#container");

    zget('compile').then(val=>{
        const {j_compile_projects, j_compile_branch} = val;
        $('#j_compile_projects').val(j_compile_projects);
        $('#j_compile_projects').attr('title',j_compile_projects);
        $('#j_compile_branch').val(j_compile_branch);
    });

    $container.on('input', '#j_compile_projects', evt=>{
        $(evt.target).attr('title', $(evt.target).val());
    });

    ["j_compile_branch", "j_compile_projects"].forEach(idStr => {
            $container.on('blur', `#${idStr}`, evt => {
                const projects = $('#j_compile_projects').val();
                const branch = $('#j_compile_branch').val();

                zset('compile', {
                    'j_compile_projects': projects,
                    'j_compile_branch': branch
                });
            })
        })

    $container.on('click', '#b_compile', evt=>{

        const projects = $('#j_compile_projects').val();
        const branch = $('#j_compile_branch').val();

        zset('compile', {
            'j_compile_projects':projects,
            'j_compile_branch': branch
        });

        compile(projects.split(','), branch);
    });
})