'use strict';

AFRAME.registerComponent('not-fullscreen', {
    init: function() {
        document.querySelector('video#video_data').pause();
    },
    tick: function () {
        var canvasEl = this.el.querySelector('canvas.a-canvas');
        canvasEl.setAttribute('style', 'width:100%;height:700px;');
    }
});

window.addEventListener("load", function () {
    var svg_config = {
        'width': 200,
        'height': 200,
        'axis_margin': 50
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
        whole_frame_count,
        line_axis = d3.line()
        .x(function(d){return d.x;})
        .y(function(d){return d.y;});
    
    var svg_init = (function() {
        svg_config.height = rect_config.height * (360 / angle_sample) + svg_config.axis_margin;
        
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
            
            var max_angle_data_lookup = angle_data_lookup.reduce(function(previous_d, current_d, idx, arr) {
                return (current_d > arr[previous_d]) ? idx : previous_d;
            }, 0);
                
            // append g of wrapping rects
            var g_wrapper = svg.append('g')
            .attr('id', 'frame_' + i.toString())
            .attr('data-frame', i.toString())
            .attr('transform', 'translate(' + (rect_config.width * i + svg_config.axis_margin).toString() + ')');

            // append rect
            angle_data_lookup.forEach(function(d, idx, arr) {
                if (idx < 360 / angle_sample)
                    g_wrapper.append('rect')
                    .attr('width', rect_config.width)
                    .attr('height', rect_config.height)
                    .attr('y', rect_config.height * idx)
                    .attr('data-count', d)
                    .attr('data-detail', arr)
                    .attr('data-angle', idx * angle_sample)
                    .style('fill', colorPick(color_level_count, d))
                    .style('stroke', (idx == max_angle_data_lookup) ? '#FFF' : 'none')
                    .on('mouseover', showCount)
                    .on('mouseleave', hideCount)
                    .on('click', showInfo);
            });
        }
        
        createColorLabel();
//        createYAxis();
//        createXAxis();
    });
    
    function colorPick(sample, angle_data) {
        return rect_config.color[
            (Math.round((rect_config.color.length / sample) * angle_data) <= rect_config.color.length) 
            ? Math.round((rect_config.color.length / sample) * angle_data) : 4
        ];
    }
    
    function videoPreview(click_node) {
        var videoData = document.getElementById('video_data');
        var count_data = click_node.parentElement.getAttribute('data-frame');
        var angle_data = click_node.getAttribute('data-angle');
        
        // set frame data
        videoData.currentTime = (count_data * frame_sample) / 60;
        document.querySelector('a-videosphere').setAttribute('rotation', '0 ' + angle_data.toString() + ' 0');
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
        videoPreview(this);
    }
    
    function createYAxis() {
        var axis = svg.append('g')
        .attr('transform', 'translate(40)');
        
        axis.append('path')
        .attr('d', line_axis(lineData))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
    }
    
    function createXAxis() {
        var axis = svg.append('g')
        .attr('transform', 'translate(40)');
        
        axis.append('path')
        .attr('d', line_axis(lineData))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
    }
    
    function createColorLabel() {
        var color_label_wrapper = svg.append('g')
        .attr('id', 'color-label')
        .attr('transform', 'translate(' + ((whole_frame_count / frame_sample) * rect_config.width + 20 + svg_config.axis_margin).toString() + ')');
        
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
