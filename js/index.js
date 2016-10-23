'use strict';

window.addEventListener("load", function () {
    var svg_config = {
        'width': 200,
        'height': 200
    };
    var rect_config = {
        'width': 5,
        'height': 5,
        // http://www.perbang.dk/rgbgradient/
        'color': [
            '#1B2CF8',
            '#5421BA',
            '#8D167C',
            '#C60B3E',
            '#FF0000'
        ]
    };

    var svg,
        rotation_data,
        frame_sample = 10,
        angle_sample = 10, // degrees
        color_level = 5,
        frame_level = 0,
        whole_frame_count;
    
    var svg_init = (function() {
        svg_config.height = rect_config.height * (360 / angle_sample);
        
        svg = d3.select('#viewgram')
        .append('svg')
        .attr('width', svg_config.width)
        .attr('height', svg_config.height);
    })();
    
    d3.json('./js/test4.json', function(err, data) {
        var color_level_count = data.sampleCount * frame_sample;
        rotation_data = data.data;
        whole_frame_count = data.frameCount;
        svg.attr('width', rect_config.width * (whole_frame_count / frame_sample) + 200);
        
        for (var i = 0; i < whole_frame_count / frame_sample; i++) {
            var frames = rotation_data.slice(i * frame_sample, (i+1) * frame_sample);
            var angle_data_lookup = new Array(360 / angle_sample).fill(0);
            
            // applied to only y-axis (yaw)
            frames.forEach(function(d, idx) {
                d.physicalRotationY.forEach(function(phy_y) {
                    angle_data_lookup[Math.round(phy_y / angle_sample)]++;
                });
            });
            
            // append g of wrapping rects
            var g_wrapper = svg.append('g')
            .attr('id', 'frame_' + i.toString())
            .attr('transform', 'translate(' + (rect_config.width * i).toString() + ')');

            // append rect
            angle_data_lookup.forEach(function(d, idx, arr) {
                g_wrapper.append('rect')
                .attr('width', rect_config.width)
                .attr('height', rect_config.height)
                .attr('y', rect_config.height * idx)
                .attr('data-count', d)
                .attr('data-detail', arr)
                .style('fill', colorPick(color_level_count, d))
                .on('mouseover', showCount)
                .on('mouseleave', hideCount)
                .on('click', showInfo);
            });
        }
        
        createColorLabel();
    });
    
    function colorPick(sample, angle_data) {
        return rect_config.color[
            (Math.round((rect_config.color.length / sample) * angle_data) <= rect_config.color.length) 
            ? Math.round((rect_config.color.length / sample) * angle_data) : 4
        ];
    }
    
    function videoPreview() {
    }
    
    function showCount() {
        d3.select(this).style('stroke', '#FFF');
    }
    
    function hideCount() {
        d3.select(this).style('stroke', 'none');
    }
    
    function showInfo() {
        document.getElementById('data_count').innerHTML = this.getAttribute('data-count');
        document.getElementById('detail_count').innerHTML = this.getAttribute('data-detail');
    }
    
    function createAxis() {
    }
    
    function createColorLabel() {
        var color_label_wrapper = svg.append('g')
        .attr('id', 'color-label')
        .attr('transform', 'translate(' + ((whole_frame_count / frame_sample) * rect_config.width + 20).toString() + ')');
        
        rect_config.color.forEach(function(color, idx) {
            color_label_wrapper.append('rect')
            .attr('width', 20)
            .attr('height', 20)
            .attr('y', 20 * idx)
            .style('fill', color);
            
            color_label_wrapper.append('text')
            .attr('x', 30)
            .attr('y', 20 * idx)
            .attr('font-size', '1em')
            .attr('dy', 15)
            .style('fill', '#FFF')
            .text( ((idx - 0.5) / (rect_config.color.length / 40)).toString() + '~' + ((idx + 0.5) / (rect_config.color.length / 40)).toString());
        });
    }
});
