# Utility for making Hydrogen songs into multiple tempos

WORKDIR='./.h2TemposWork/'
PATTERNS=('var1' 'var2' 'var1fill1' 'var1fill2' 'var2fill1' 'var2fill2' 'intro' 'end')
START=40
END=200
STEP=20
DIR='./'
NAME='hydrygenDrumLoop'
GENRE='all'
CALLDIR=$PWD

Help() {
    echo "Help for h2tempos"
    echo ""
    echo "Usage h2tempos [-h] [-t] [-d] [-n]"
    echo ""
    echo "-h - Show this help message"
    echo "-t - Tempos start,stop,step (e.g. 40,200,10 creates beats from 40 to 200 in steps of 10"
    echo "-d - Directory where the h2song files are located"
    echo "-n - Name of the rhythm"
    echo "-g - Genres"
    echo ""
    echo "Inside the passed directory there must be files named"
    for p in "${PATTERNS[@]}"
    do
        echo "$p.h2song"
    done
}

while getopts ":ht:d:n:g:" opt; do 
    case ${opt} in 
        h )
            Help
            exit;;
        t )
            IFS=',' read -r -a array <<< "$OPTARG"
            START="${array[0]}"
            END="${array[1]}"
            STEP="${array[2]}"
            ;;
        d )
            DIR=$OPTARG
        ;;
        n )
            NAME=$OPTARG
        ;;
        g )
            GENRE=$OPTARG
        ;;
        \? ) echo "Unknown option" 
            Help
            exit;;
    esac
done

echo "Creating rhythm files from $START bpm to $END bpm in steps of $STEP bpm..."
echo "Using h2song files from directory $DIR"
echo "Creating rhythm named $NAME"

if [ -d "$WORKDIR" ]; then rm -r $WORKDIR;fi;

echo "Creating work directories for all tempos"
tempo=$START
while [ $tempo -lt $END ]
do
    wdir="$WORKDIR/tempo$tempo/tracks/"
    echo "Creating directory $wdir"
    mkdir -p $wdir

    for p in "${PATTERNS[@]}"
    do
        echo "Creating wav for $p at $tempo bpm"
        # Terminate if file does not exists
        h2file="$DIR/$p.h2song"
        if [ -f $h2file ]; then
            cp $h2file $WORKDIR
            xmlstarlet ed -L -u "//song/bpm" --value $tempo "$WORKDIR/$p.h2song"
            h2cli -s "$WORKDIR/$p.h2song" -o "$wdir/$p.wav" > "$WORKDIR/h2log.txt" 2>&1
        else
            echo "File $h2file does not exist. Terminating."
            exit
        fi
    done

    # Write info.json file
    infofile="$wdir/info.json"
    echo "{" > $infofile
    echo "  \"author\": \"$USER\"," >> "$infofile"
    echo "  \"name\": \"$NAME\"," >> "$infofile"
    echo "  \"tempo\": $tempo," >> "$infofile"
    echo "  \"genres\": \"$GENRE\"," >> "$infofile"
    echo "  \"tracks\": {" >> "$infofile"
    echo "    \"intro\": \"intro.wav\"," >> "$infofile"
    echo "    \"end\": \"end.wav\"," >> "$infofile"
    echo "    \"var1\": {" >> "$infofile"
    echo "      \"main\": \"var1.wav\"," >> "$infofile"
    echo "      \"fill1\": \"var1fill1.wav\"," >> "$infofile"
    echo "      \"fill2\": \"var1fill2.wav\"" >> "$infofile"
    echo "    }," >> "$infofile"
    echo "    \"var2\": {" >> "$infofile"
    echo "      \"main\": \"var2.wav\"," >> "$infofile"
    echo "      \"fill1\": \"var2fill1.wav\"," >> "$infofile"
    echo "      \"fill2\": \"var2fill2.wav\"" >> "$infofile"
    echo "    }" >> "$infofile"
    echo "  }" >> "$infofile"
    echo "}" >> "$infofile"

    # Create zip file
    cd "$WORKDIR/tempo$tempo/"
    zip -r "$CALLDIR/$NAME$tempo.zip" tracks
    cd $CALLDIR

    tempo=$(($tempo+$STEP))
done
